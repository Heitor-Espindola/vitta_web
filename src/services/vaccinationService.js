import { subscribe } from "firebase/data-connect";
import { asDate } from "../utils/dates";
import {
  createApplication,
  deleteApplication,
  getProfessionalByUser,
  getUserByEmail,
  listApplicationsRef,
  listApplicationsByPatientRef,
  updateApplication,
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
    patientId: patient.id || "",
    patientName: user.name || "Paciente não informado",
    patientCpf: user.cpf || "",
    vaccineId: vaccine.id || "",
    vaccineName: vaccine.name || "Vacina não informada",
    vaccineRequiredDoses: vaccine.requiredDoses ?? null,
    batchId: batch?.id || "",
    batchCode: batch?.batchCode || "",
    manufacturer: batch?.manufacturer || "",
    expirationDate: batch?.expirationDate || null,
    appointmentId: application?.appointment?.id || "",
    professionalId: professional.id || "",
    professionalName: professionalUser.name || "Profissional não informado",
    professionalType: professional.professionalType || "OTHER",
    professionalRegistration: professional.professionalRegistration || "",
    ubsId: ubs.id || "",
    ubsName: ubs.name || "UBS não informada",
    applicationDate: application?.applicationDate || null,
    doseNumber: application?.doseNumber ?? null,
    doseLabel:
      application?.doseNumber != null
        ? `${application.doseNumber}ª dose`
        : "Dose não informada",
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

export function watchApplications(onData, onError) {
  return subscribe(
    listApplicationsRef(),
    (result) => {
      const applications = result?.data?.applications || [];
      onData(sortApplications(applications.map(mapApplication)));
    },
    onError,
  );
}

export function watchPatientRecords(patientId, onData, onError) {
  return subscribe(
    listApplicationsByPatientRef({ patientId }),
    (result) => {
      const applications = result?.data?.applications || [];
      onData(sortApplications(applications.map(mapApplication)));
    },
    onError,
  );
}

export async function resolveCurrentProfessional(firebaseUser) {
  const email = String(firebaseUser?.email || "").trim().toLowerCase();
  if (!email) {
    throw new Error("A conta autenticada não possui um e-mail válido.");
  }

  const userResult = await getUserByEmail({ email });
  const user = userResult?.data?.users?.[0];
  if (!user?.id) {
    throw new Error("O usuário autenticado não possui cadastro no Vitta SQL.");
  }

  const professionalResult = await getProfessionalByUser({ userId: user.id });
  const professional = professionalResult?.data?.professionals?.[0];
  if (!professional?.id) {
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
    patientId,
    vaccineId,
    batchId,
    appointmentId,
    professionalId,
    ubsId,
    applicationDate,
    doseNumber,
    notes,
  },
) {
  return updateApplication({
    id,
    patientId,
    vaccineId,
    batchId: batchId || null,
    appointmentId: appointmentId || null,
    professionalId,
    ubsId,
    applicationDate: timestampFromDateInput(applicationDate),
    doseNumber: doseNumber ? Number(doseNumber) : null,
    notes: textOrNull(notes),
  });
}

export async function removeApplication(id) {
  return deleteApplication({ id });
}
