import { QueryFetchPolicy, subscribe } from "firebase/data-connect";
import { assertBirthDate } from "../utils/dates";
import {
  createPatientAuthAccount,
  requestPasswordReset,
} from "./authService";
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

export function watchPatients(onData, onError) {
  return subscribe(
    listPatientsRef(),
    (result) => {
      const patients = result?.data?.patients || [];

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
  const patient = result?.data?.patients?.[0];

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

async function findUserByCpf(cpf) {
  const result = await getAdminUserByCpf(
    { cpf },
    { fetchPolicy: QueryFetchPolicy.SERVER_ONLY },
  );

  return result?.data?.users?.[0] || null;
}

function isCpfUniqueConflict(error) {
  const raw = [error?.message, error?.code].filter(Boolean).join(" ");
  return /user_cpf_uidx|ALREADY_EXISTS/i.test(raw);
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
  const isDependent = Boolean(responsibleId);

  if (
    !cleanName ||
    !birthDate ||
    (!cleanEmail && !isDependent) ||
    !cleanCpfValue
  ) {
    throw new Error(
      isDependent
        ? "Preencha nome, nascimento e CPF."
        : "Preencha nome, nascimento, e-mail e CPF.",
    );
  }

  assertBirthDate(birthDate);

  if (!isValidCpf(cleanCpfValue)) {
    throw new Error("Informe um CPF válido.");
  }

  let user = await findUserByCpf(cleanCpfValue);
  let createdUserId = null;
  let authAccount = null;
  let targetAuthUid = null;

  if (user?.patient_on_user?.id) {
    throw new Error("Já existe um cadastro de paciente para este CPF.");
  }

  let existingProfessional = user?.professional_on_user || null;
  let sharedEmail =
    existingProfessional?.email?.trim().toLowerCase() === cleanEmail;

  try {
    if (!user) {
      try {
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
      } catch (createError) {
        if (!isCpfUniqueConflict(createError)) throw createError;

        // Outro cadastro pode ter inserido o CPF durante a consulta inicial.
        user = await findUserByCpf(cleanCpfValue);

        if (!user) throw createError;

        if (user.patient_on_user?.id) {
          throw new Error("Já existe um cadastro de paciente para este CPF.", {
            cause: createError,
        });
        }

        existingProfessional = user.professional_on_user || null;
        sharedEmail =
          existingProfessional?.email?.trim().toLowerCase() === cleanEmail;
      }
    }

    // Uma pessoa com perfil profissional pode compartilhar a mesma conta
    // quando os dois perfis utilizam o mesmo e-mail.
    if (!isDependent) {
      if (sharedEmail && existingProfessional?.authUid) {
        targetAuthUid = existingProfessional.authUid;
      } else {
        authAccount = await createPatientAuthAccount(cleanEmail);
        targetAuthUid = authAccount.uid;
      }
    }

    // Dependentes vinculados a um responsável não recebem conta própria.
    await createPatient({
      userId: user.id,
      email: cleanEmail || null,
      authUid: targetAuthUid,
      patientType,
      responsibleId: responsibleId || null,
    });
  } catch (error) {
    if (authAccount) {
      await authAccount.rollback().catch(() => {});
    }

    if (createdUserId) {
      await deleteUnlinkedUser({ id: createdUserId }).catch(() => {});
    }

    throw error;
  } finally {
    if (authAccount) {
      await authAccount.close();
    }
  }

  let passwordResetSent = false;

  if (authAccount) {
    try {
      await requestPasswordReset(cleanEmail);
      passwordResetSent = true;
    } catch {
      passwordResetSent = false;
    }
  }

  return {
    passwordResetSent,
    hasAuthenticationAccount: Boolean(targetAuthUid),
    reusedAuthenticationAccount: Boolean(
      !isDependent && !authAccount && targetAuthUid,
    ),
    dependentWithoutOwnAccount: isDependent,
  };
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

  const isDependent = Boolean(responsibleId);

  if (
    !cleanName ||
    !birthDate ||
    (!cleanEmail && !isDependent) ||
    !cleanCpfValue
  ) {
    throw new Error("Preencha os dados obrigatórios do paciente.");
  }

  assertBirthDate(birthDate);

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
    email: cleanEmail || null,
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
