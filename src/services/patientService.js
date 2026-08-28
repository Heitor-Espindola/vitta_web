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

const accessDurationMs = 25 * 60 * 1000;

export class PatientLookupError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "PatientLookupError";
    this.code = code;
  }
}

export function mapPatient(personId, data = {}) {
  const cpf = data.cpfFormatted || data.cpfDigits || data.cpf || "";
  return {
    personId,
    name: data.fullName || data.name || "Paciente",
    birthDate: data.birthDate || null,
    maskedCpf: maskCpf(cpf),
    accountStatus: data.accountStatus || "active",
    photoUrl: data.photoUrl || null,
  };
}

export async function authorizePatientLookup({ cpf, professionalUid }) {
  if (!isValidCpf(cpf)) {
    throw new PatientLookupError("invalid-cpf", "Informe um CPF válido.");
  }

  const cpfHash = await cpfRegistryHash(cpf);
  const registrySnapshot = await getDoc(doc(db, "cpf_registry", cpfHash));
  if (!registrySnapshot.exists()) {
    throw new PatientLookupError(
      "patient-not-found",
      "Nenhum paciente foi localizado com este CPF.",
    );
  }

  const registry = registrySnapshot.data();
  const personId = String(registry.personId || registry.ownerUid || "").trim();
  if (!personId) {
    throw new PatientLookupError(
      "invalid-registry",
      "O cadastro foi localizado, mas precisa de revisão de identidade.",
    );
  }

  const accessId = `${professionalUid}_${personId}`;
  const accessRef = doc(db, "professional_patient_access", accessId);
  await setDoc(accessRef, {
    professionalUid,
    patientId: personId,
    cpfHash,
    expiresAt: Timestamp.fromMillis(Date.now() + accessDurationMs),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const patientSnapshot = await getDoc(doc(db, "users", personId));
  if (!patientSnapshot.exists()) {
    throw new PatientLookupError(
      "patient-not-found",
      "O registro de CPF existe, mas o perfil do paciente não foi encontrado.",
    );
  }

  sessionStorage.setItem("vitta:selectedPatientId", personId);
  return mapPatient(personId, patientSnapshot.data());
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
  return sessionStorage.getItem("vitta:selectedPatientId") || "";
}
