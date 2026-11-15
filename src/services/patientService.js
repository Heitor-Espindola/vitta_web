import { subscribe } from "firebase/data-connect";
import {
  archivePatient,
  createPatient,
  createUser,
  deleteUnlinkedUser,
  getAdminPatient,
  getAdminPatientByCpf,
  getAdminUserByCpf,
  getAuthorizedPatientByCpf,
  getPatient,
  getPatientByUser,
  listAccessiblePatientsRef,
  listPatientsRef,
  updatePatient,
  updateUser,
} from "@dataconnect/generated";
import { formatCpf, isValidCpf, maskCpf } from "../utils/cpf";

export class PatientLookupError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PatientLookupError";
    this.code = code;
  }
}

function cleanText(value) {
  const text = String(value ?? "").trim();
  return text || "";
}

function cleanCpf(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function mapPatient(patient) {
  const user = patient?.user || {};
  const responsible = patient?.responsible || {};

  return {
    id: patient?.id || "",
    personId: patient?.id || "",
    userId: user.id || "",
    name: user.name || "Paciente",
    fullName: user.name || "Paciente",
    birthDate: user.birthDate || null,
    email: patient?.email || "",
    authUid: patient?.authUid || "",
    cpf: user.cpf || "",
    maskedCpf: maskCpf(user.cpf || ""),
    sex: user.sex || "",
    status: user.status || "ACTIVE",
    patientType: patient?.patientType || "ADULT",

    responsibleId: responsible.id || "",
    responsibleName: responsible.user?.name || "",
    responsibleCpf: responsible.user?.cpf || "",
    responsibleEmail: responsible.email || "",
  };
}

export function watchPatients(onData, onError, { isAdmin = false } = {}) {
  return subscribe(
    isAdmin ? listPatientsRef() : listAccessiblePatientsRef(),
    (result) => {
      const patients = isAdmin
        ? result?.data?.patients || []
        : (result?.data?.patientAccesses || [])
            .map((access) => access?.patient)
            .filter(Boolean);

      const mapped = patients
        .map(mapPatient)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      onData(mapped);
    },
    onError,
  );
}

export async function getPatientById(id, { isAdmin = false } = {}) {
  const result = isAdmin
    ? await getAdminPatient({ id })
    : await getPatient({ id });
  const patient = result?.data?.patient;

  if (!patient) {
    throw new PatientLookupError(
      "patient-not-found",
      "Paciente não encontrado.",
    );
  }

  return mapPatient(patient);
}

export async function getPatientByUserId(userId) {
  const result = await getPatientByUser({ userId });
  const patient = result?.data?.patients?.[0];

  if (!patient) {
    throw new PatientLookupError(
      "patient-not-found",
      "O usuário localizado não possui um cadastro de paciente.",
    );
  }

  return mapPatient(patient);
}

export async function authorizePatientLookup({ cpf, isAdmin = false }) {
  const digits = cleanCpf(cpf);

  if (!isValidCpf(digits)) {
    throw new PatientLookupError("invalid-cpf", "Informe um CPF válido.");
  }

  const result = isAdmin
    ? await getAdminPatientByCpf({ cpf: digits })
    : await getAuthorizedPatientByCpf({ cpf: digits });
  const patient = isAdmin
    ? result?.data?.patients?.[0]
    : result?.data?.patientAccesses?.[0]?.patient;

  if (!patient) {
    throw new PatientLookupError(
      "patient-not-found",
      "Nenhum paciente foi localizado com este CPF.",
    );
  }

  return mapPatient(patient);
}

export async function getAuthorizedPatient(personId, options) {
  return getPatientById(personId, options);
}

export async function addPatient({
  name,
  birthDate,
  email,
  status,
  cpf,
  sex,
  patientType,
  responsibleId,
}) {
  const cleanName = cleanText(name);
  const cleanEmail = cleanText(email).toLowerCase();
  const cleanCpfValue = cleanCpf(cpf);

  if (!cleanName || !birthDate || !cleanEmail || !cleanCpfValue) {
    throw new Error("Preencha nome, nascimento, e-mail e CPF.");
  }

  if (!isValidCpf(cleanCpfValue)) {
    throw new Error("Informe um CPF válido.");
  }

  const existingResult = await getAdminUserByCpf({
    cpf: cleanCpfValue,
  });

  let user = existingResult?.data?.users?.[0];
  let createdUserId = null;

  if (user?.patient_on_user?.id) {
    throw new Error("Já existe um cadastro de paciente para este CPF.");
  }

  const existingProfessional = user?.professional_on_user || null;

  const sharedEmail =
    existingProfessional?.email?.trim().toLowerCase() === cleanEmail;

  const sharedAuthUid = sharedEmail
    ? existingProfessional.authUid
    : null;

  try {
    if (!user) {
      const createResult = await createUser({
        name: cleanName,
        birthDate,
        status,
        cpf: cleanCpfValue,
        sex: cleanText(sex) || null,
      });

      createdUserId = createResult?.data?.user_insert?.id || null;

      if (!createdUserId) {
        throw new Error("O usuário foi criado, mas seu ID não foi retornado.");
      }
      
      user = { id: createdUserId };
    }

    await createPatient({
      userId: user.id,
      email: cleanEmail,
      authUid: sharedAuthUid,
      patientType,
      responsibleId: responsibleId || null,
    });
  } catch (error) {
    if (createdUserId) {
      await deleteUnlinkedUser({ id: createdUserId }).catch(() => {});
    }

    throw error;
  }
}


export async function editPatient(
  patient,
  { name, birthDate, email, status, cpf, sex, patientType, responsibleId },
) {
  const cleanName = cleanText(name);
  const cleanEmail = cleanText(email).toLowerCase();
  const cleanCpfValue = cleanCpf(cpf);

  if (!patient?.id || !patient?.userId) {
    throw new Error("O paciente selecionado é inválido.");
  }

  if (!cleanName || !birthDate || !cleanEmail || !cleanCpfValue) {
    throw new Error("Preencha nome, nascimento, e-mail e CPF.");
  }

  if (!isValidCpf(cleanCpfValue)) {
    throw new Error("Informe um CPF válido.");
  }

  await updateUser({
    id: patient.userId,
    name: cleanName,
    birthDate,
    status,
    cpf: cleanCpfValue,
    sex: cleanText(sex) || null,
  });

  await updatePatient({
    id: patient.id,
    email: cleanEmail,
    patientType,
    responsibleId: responsibleId || null,
  });
}

export async function removePatient(patient) {
  if (!patient?.id || !patient?.userId) {
    throw new Error("O paciente selecionado é inválido.");
  }

  await archivePatient({
    id: patient.id,
  });
}

export function selectedPatientId() {
  return sessionStorage.getItem("vitta:selectedPatientId") || "";
}

export function rememberSelectedPatient(patientId) {
  if (patientId) {
    sessionStorage.setItem("vitta:selectedPatientId", patientId);
  }
}

export function clearSelectedPatient() {
  sessionStorage.removeItem("vitta:selectedPatientId");
}

export function formatPatientCpf(value) {
  return formatCpf(value);
}

export function mapPatientFromResult(user, patient) {
  return mapPatient({
    ...patient,
    user,
  });
}
