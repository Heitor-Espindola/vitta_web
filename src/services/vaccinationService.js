import { subscribe } from "firebase/data-connect";
import { asDate } from "../utils/dates";
import {
  createApplication,
  getCurrentPortalUser,
  listAdminApplicationsByPatientRef,
  listApplicationsRef,
  listApplicationsByPatientRef,
  listCurrentProfessionalApplicationsRef,
  updateApplication,
  voidApplication,
} from "@dataconnect/generated";

function textOrNull(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

export function mapApplication(application) {
  const patient = application?.patient || {};
  const user = patient?.user || {};
  const vaccine = application?.vaccine || {};
  const batch = application?.batch || null;
  const professional = application?.professional || {};
  const professionalUser = professional?.user || {};
  const ubs = application?.ubs || {};

  return {
    id: application?.id || "",
    patientId: patient.id || application?.patientIdSnapshot || "",
    patientName:
      user.name || application?.patientNameSnapshot || "Paciente não informado",
    patientCpf: user.cpf || "",
    vaccineId: vaccine.id || "",
    vaccineName:
      vaccine.name || application?.vaccineNameSnapshot || "Vacina não informada",
    vaccineRequiredDoses: vaccine.requiredDoses ?? null,
    batchId: batch?.id || "",
    batchCode: batch?.batchCode || application?.lotSnapshot || "",
    manufacturer:
      batch?.manufacturer || application?.manufacturerSnapshot || "",
    expirationDate: batch?.expirationDate || null,
    appointmentId: application?.appointment?.id || "",
    professionalId: professional.id || "",
    professionalName:
      professionalUser.name ||
      application?.professionalNameSnapshot ||
      "Profissional não informado",
    professionalType: professional.professionalType || "OTHER",
    professionalRegistration:
      professional.professionalRegistration ||
      application?.professionalRegistrationSnapshot ||
      "",
    ubsId: ubs.id || "",
    ubsName:
      ubs.name || application?.facilityNameSnapshot || "UBS não informada",
    applicationDate: application?.applicationDate || null,
    doseNumber: application?.doseNumber ?? null,
    doseLabel:
      application?.doseLabel ||
      (application?.doseNumber != null
        ? `${application.doseNumber}ª dose`
        : "Dose não informada"),
    nextDoseAt: application?.nextDoseAt || null,
    voidedAt: application?.voidedAt || null,
    voidReason: application?.voidReason || "",
    notes: application?.notes || "",
    source: "sql_connect",
  };
}

function sortApplications(items) {
  return [...items].sort((a, b) => {
    const dateA = asDate(a.applicationDate)?.getTime() || 0;
    const dateB = asDate(b.applicationDate)?.getTime() || 0;
    return dateB - dateA;
  });
}

export function watchApplications(onData, onError, { isAdmin = false } = {}) {
  return subscribe(
    isAdmin ? listApplicationsRef() : listCurrentProfessionalApplicationsRef(),
    (result) => {
      const applications = result?.data?.applications || [];
      onData(sortApplications(applications.map(mapApplication)));
    },
    onError,
  );
}

export function watchPatientRecords(
  patientId,
  onData,
  onError,
  { isAdmin = false } = {},
) {
  return subscribe(
    isAdmin
      ? listAdminApplicationsByPatientRef({ patientId })
      : listApplicationsByPatientRef({ patientId }),
    (result) => {
      const applications = result?.data?.applications || [];
      onData(sortApplications(applications.map(mapApplication)));
    },
    onError,
  );
}

export async function resolveCurrentProfessional(firebaseUser) {
  if (!firebaseUser?.uid) {
    throw new Error("A sessão profissional não está autenticada.");
  }
  const result = await getCurrentPortalUser();
  const user = result?.data?.users?.[0];
  if (!user?.id || user.authUid !== firebaseUser.uid) {
    throw new Error("O usuário autenticado não possui cadastro no Vitta SQL.");
  }
  const professional = user.professional_on_user;
  if (!professional?.id || professional.active !== true) {
    throw new Error("A conta autenticada não possui cadastro profissional.");
  }
  if (!professional.ubs?.id) {
    throw new Error("O profissional autenticado não possui uma UBS vinculada.");
  }

  return professional;
}

function timestampFromDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Informe uma data de aplicação válida.");
  }
  return new Date(`${value}T12:00:00-03:00`).toISOString();
}

export async function registerVaccination({
  patientId,
  vaccineId,
  batchId,
  applicationDate,
  doseNumber,
  notes,
  firebaseUser,
}) {
  if (!patientId || !vaccineId) {
    throw new Error("Selecione o paciente e a vacina.");
  }

  const professional = await resolveCurrentProfessional(firebaseUser);

  return createApplication({
    patientId,
    vaccineId,
    batchId: batchId || null,
    appointmentId: null,
    professionalId: professional.id,
    ubsId: professional.ubs.id,
    applicationDate: timestampFromDateInput(applicationDate),
    doseNumber: doseNumber ? Number(doseNumber) : null,
    notes: textOrNull(notes),
  });
}

export async function editApplication(
  id,
  {
    doseNumber,
    doseLabel,
    nextDoseAt,
    notes,
  },
) {
  return updateApplication({
    id,
    doseNumber: doseNumber ? Number(doseNumber) : null,
    doseLabel: textOrNull(doseLabel),
    nextDoseAt: nextDoseAt || null,
    notes: textOrNull(notes),
  });
}

export async function removeApplication(id, reason) {
  const cleanReason = String(reason ?? "").trim();
  if (!cleanReason) {
    throw new Error("Informe o motivo da anulação.");
  }
  return voidApplication({ id, reason: cleanReason });
}
