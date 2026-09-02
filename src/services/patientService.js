import {
  Timestamp,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  cpfRegistryHash,
  isValidCpf,
  maskCpf,
} from "../utils/cpf";

export const patientAccessDurationMs = 25 * 60 * 1000;

export class PatientLookupError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PatientLookupError";
    this.code = code;
  }
}

export function mapPatient(personId, data = {}, fallbackCpf = "") {
  const cpf =
    data.cpfFormatted || data.cpfDigits || data.cpf || fallbackCpf;
  return {
    personId,
    name: data.fullName || data.name || "Paciente",
    birthDate: data.birthDate || null,
    maskedCpf: maskCpf(cpf),
    accountStatus: data.accountStatus || null,
    photoUrl: data.photoUrl || null,
  };
}

export async function authorizePatientLookupWithGateway(
  { cpf, professionalUid },
  {
    lookupRegistry,
    writeAccess,
    loadPatient,
    storage = globalThis.sessionStorage,
    now = () => Date.now(),
  },
) {
  if (!isValidCpf(cpf)) {
    throw new PatientLookupError("invalid-cpf", "Informe um CPF válido.");
  }
  if (!String(professionalUid || "").trim()) {
    throw new PatientLookupError(
      "invalid-professional-session",
      "Sua sessão profissional não pôde ser validada.",
    );
  }

  const cpfHash = await cpfRegistryHash(cpf);
  const registry = await lookupRegistry(cpfHash);
  if (!registry) {
    throw new PatientLookupError(
      "patient-not-found",
      "Confira o CPF informado ou solicite que o paciente realize o cadastro no Vitta.",
    );
  }

  const personId = String(registry.personId || registry.ownerUid || "").trim();
  if (!personId) {
    throw new PatientLookupError(
      "invalid-registry",
      "Não foi possível abrir esta carteira no momento.",
    );
  }

  const accessId = `${professionalUid}_${personId}`;
  await writeAccess(accessId, {
    professionalUid,
    patientId: personId,
    cpfHash,
    expiresAt: Timestamp.fromMillis(now() + patientAccessDurationMs),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const patientData = await loadPatient(personId);
  if (!patientData) {
    throw new PatientLookupError(
      "patient-not-found",
      "Confira o CPF informado ou solicite que o paciente realize o cadastro no Vitta.",
    );
  }

  storage?.setItem("vitta:selectedPatientId", personId);
  return mapPatient(personId, patientData, cpf);
}

export async function authorizePatientLookup(input) {
  return authorizePatientLookupWithGateway(input, {
    lookupRegistry: async (cpfHash) => {
      const snapshot = await getDoc(doc(db, "cpf_registry", cpfHash));
      return snapshot.exists() ? snapshot.data() : null;
    },
    writeAccess: (accessId, payload) =>
      setDoc(doc(db, "professional_patient_access", accessId), payload),
    loadPatient: async (personId) => {
      const snapshot = await getDoc(doc(db, "users", personId));
      return snapshot.exists() ? snapshot.data() : null;
    },
  });
}

export async function getAuthorizedPatient(personId) {
  const snapshot = await getDoc(doc(db, "users", personId));
  if (!snapshot.exists()) {
    throw new PatientLookupError(
      "patient-not-found",
      "Paciente não encontrado ou autorização expirada.",
    );
  }
  return mapPatient(personId, snapshot.data());
}

export function selectedPatientId() {
  return globalThis.sessionStorage?.getItem("vitta:selectedPatientId") || "";
}

export function isPatientAccessExpired(error) {
  const code = String(error?.code || "").replace("firestore/", "");
  return code === "permission-denied" || code === "access-expired";
}

export function patientAccessErrorMessage(error) {
  if (isPatientAccessExpired(error)) {
    return "O acesso a esta carteira expirou.";
  }
  if (error instanceof PatientLookupError) return error.message;
  return "Não foi possível abrir esta carteira no momento.";
}
