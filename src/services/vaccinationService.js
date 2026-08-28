import {
  Timestamp,
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { dateFromInput } from "../utils/dates";
import { doseNumberFromLabel } from "../utils/vaccination";

export function mapVaccinationRecord(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

function optionalText(value) {
  const text = String(value || "").trim();
  return text || null;
}

export function buildVaccinationRecord({
  patientId,
  professionalUid,
  vaccine,
  doseLabel,
  appliedDate,
  nextDoseDate,
  lot,
  manufacturer,
  facilityId,
  facilityName,
  notes,
}) {
  const appliedAt = dateFromInput(appliedDate);
  const nextDoseAt = nextDoseDate ? dateFromInput(nextDoseDate) : null;
  if (!patientId || !professionalUid || !vaccine?.id || !vaccine?.name) {
    throw new Error("Dados obrigatórios da aplicação não foram informados.");
  }
  if (!doseLabel?.trim() || !appliedAt) {
    throw new Error("Informe a dose e uma data de aplicação válida.");
  }
  if (nextDoseDate && !nextDoseAt) {
    throw new Error("Informe uma data válida para a próxima dose.");
  }

  const doseNumber = doseNumberFromLabel(doseLabel);
  return {
    patientId,
    vaccineId: vaccine.id,
    vaccineName: vaccine.name.trim(),
    doseLabel: doseLabel.trim(),
    ...(doseNumber ? { doseNumber } : {}),
    appliedAt: Timestamp.fromDate(appliedAt),
    ...(nextDoseAt ? { nextDoseAt: Timestamp.fromDate(nextDoseAt) } : {}),
    ...(optionalText(lot) ? { lot: optionalText(lot) } : {}),
    ...(optionalText(manufacturer)
      ? { manufacturer: optionalText(manufacturer) }
      : {}),
    ...(optionalText(facilityId)
      ? { facilityId: optionalText(facilityId) }
      : {}),
    ...(optionalText(facilityName)
      ? { facilityName: optionalText(facilityName) }
      : {}),
    ...(optionalText(notes) ? { notes: optionalText(notes) } : {}),
    professionalUid,
    source: "professional_panel",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function registerVaccination(input) {
  const payload = buildVaccinationRecord(input);
  return addDoc(collection(db, "vaccination_records"), payload);
}

export function watchPatientRecords(patientId, onData, onError) {
  const recordsQuery = query(
    collection(db, "vaccination_records"),
    where("patientId", "==", patientId),
    orderBy("appliedAt", "desc"),
  );
  return onSnapshot(
    recordsQuery,
    (snapshot) => onData(snapshot.docs.map(mapVaccinationRecord)),
    onError,
  );
}

export function watchProfessionalRecords(professionalUid, onData, onError) {
  const recordsQuery = query(
    collection(db, "vaccination_records"),
    where("professionalUid", "==", professionalUid),
    orderBy("appliedAt", "desc"),
    limit(100),
  );
  return onSnapshot(
    recordsQuery,
    (snapshot) => onData(snapshot.docs.map(mapVaccinationRecord)),
    onError,
  );
}
