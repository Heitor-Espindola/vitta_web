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
import { dateFromInput, toLocalDateInput } from "../utils/dates";
import { doseNumberFromLabel } from "../utils/vaccination";

export function mapVaccinationRecord(snapshot) {
  return { id: snapshot.id, ...snapshot.data() };
}

export function mapVaccinationSnapshot(snapshot) {
  return snapshot.docs.map(mapVaccinationRecord);
}

function optionalText(value, maximumLength, fieldName) {
  const text = String(value || "").trim();
  if (text.length > maximumLength) {
    throw new Error(`${fieldName} excede o limite permitido.`);
  }
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
  now = new Date(),
}) {
  const appliedAt = dateFromInput(appliedDate);
  const nextDoseAt = nextDoseDate ? dateFromInput(nextDoseDate) : null;
  if (!patientId || !professionalUid) {
    throw new Error("Paciente e profissional são obrigatórios.");
  }
  if (!vaccine?.id || !vaccine?.name?.trim()) {
    throw new Error("Selecione uma vacina do catálogo.");
  }
  if (!doseLabel?.trim() || !appliedAt) {
    throw new Error("Informe a dose e uma data de aplicação válida.");
  }
  if (doseLabel.trim().length > 40) {
    throw new Error("A dose excede o limite permitido.");
  }
  const today = dateFromInput(toLocalDateInput(now));
  if (appliedAt.getFullYear() < 1900 || appliedAt > today) {
    throw new Error("A data de aplicação deve estar entre 1900 e hoje.");
  }
  if (nextDoseDate && !nextDoseAt) {
    throw new Error("Informe uma data válida para a próxima dose.");
  }
  if (nextDoseAt && nextDoseAt < appliedAt) {
    throw new Error("A próxima dose não pode ser anterior à aplicação.");
  }
  if (nextDoseAt && nextDoseAt.getFullYear() > 2100) {
    throw new Error("Informe uma data válida para a próxima dose.");
  }

  const doseNumber = doseNumberFromLabel(doseLabel);
  const normalizedLot = optionalText(lot, 80, "O lote");
  const normalizedManufacturer = optionalText(
    manufacturer,
    120,
    "O fabricante",
  );
  const normalizedFacilityId = optionalText(facilityId, 120, "A unidade");
  const normalizedFacilityName = optionalText(
    facilityName,
    140,
    "A unidade",
  );
  const normalizedNotes = optionalText(notes, 600, "As observações");
  return {
    patientId,
    vaccineId: vaccine.id,
    vaccineName: vaccine.name.trim(),
    doseLabel: doseLabel.trim(),
    ...(doseNumber ? { doseNumber } : {}),
    appliedAt: Timestamp.fromDate(appliedAt),
    ...(nextDoseAt ? { nextDoseAt: Timestamp.fromDate(nextDoseAt) } : {}),
    ...(normalizedLot ? { lot: normalizedLot } : {}),
    ...(normalizedManufacturer ? { manufacturer: normalizedManufacturer } : {}),
    ...(normalizedFacilityId ? { facilityId: normalizedFacilityId } : {}),
    ...(normalizedFacilityName ? { facilityName: normalizedFacilityName } : {}),
    ...(normalizedNotes ? { notes: normalizedNotes } : {}),
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
    (snapshot) => onData(mapVaccinationSnapshot(snapshot)),
    onError,
  );
}

export function watchProfessionalRecords(professionalUid, onData, onError) {
  const scope = professionalRecordsQueryScope(professionalUid);
  const recordsQuery = query(
    collection(db, scope.collection),
    where(scope.field, "==", scope.value),
    orderBy(scope.orderBy, scope.direction),
    limit(scope.limit),
  );
  return onSnapshot(
    recordsQuery,
    (snapshot) => onData(mapVaccinationSnapshot(snapshot)),
    onError,
  );
}

export function watchProfessionalReportRecords(
  professionalUid,
  onData,
  onError,
) {
  const scope = professionalReportQueryScope(professionalUid);
  const recordsQuery = query(
    collection(db, scope.collection),
    where(scope.field, "==", scope.value),
    orderBy(scope.orderBy, scope.direction),
  );
  return onSnapshot(
    recordsQuery,
    (snapshot) => onData(mapVaccinationSnapshot(snapshot)),
    onError,
  );
}

export function professionalRecordsQueryScope(professionalUid) {
  if (!professionalUid) {
    throw new Error("O UID profissional é obrigatório.");
  }
  return {
    collection: "vaccination_records",
    field: "professionalUid",
    value: professionalUid,
    orderBy: "appliedAt",
    direction: "desc",
    limit: 100,
  };
}

export function professionalReportQueryScope(professionalUid) {
  const scope = professionalRecordsQueryScope(professionalUid);
  return {
    collection: scope.collection,
    field: scope.field,
    value: scope.value,
    orderBy: scope.orderBy,
    direction: scope.direction,
  };
}
