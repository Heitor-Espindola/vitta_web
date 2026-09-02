import { asDate } from "./dates";

export function vaccinationStatus(record, now = new Date()) {
  const nextDose = asDate(record?.nextDoseAt);
  if (!nextDose) return "applied";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(
    nextDose.getFullYear(),
    nextDose.getMonth(),
    nextDose.getDate(),
  );
  return due < today ? "overdue" : "upcoming";
}

export const statusLabels = {
  applied: "Aplicada",
  upcoming: "Próxima",
  overdue: "Atrasada",
};

export const vaccinationRecordCapabilities = Object.freeze({
  canUpdate: false,
  canDelete: false,
});

export function derivePatientRecordSummary(records = [], now = new Date()) {
  const orderedRecords = [...records].sort((first, second) => {
    const firstDate = asDate(first?.appliedAt)?.getTime() || 0;
    const secondDate = asDate(second?.appliedAt)?.getTime() || 0;
    return secondDate - firstDate;
  });
  const scheduledRecords = orderedRecords
    .filter((record) => vaccinationStatus(record, now) !== "applied")
    .sort((first, second) => {
      const firstDate = asDate(first?.nextDoseAt)?.getTime() || Infinity;
      const secondDate = asDate(second?.nextDoseAt)?.getTime() || Infinity;
      return firstDate - secondDate;
    });

  return {
    orderedRecords,
    total: orderedRecords.length,
    lastRecord: orderedRecords[0] || null,
    nextRecord: scheduledRecords[0] || null,
    scheduledCount: scheduledRecords.length,
  };
}

export function doseNumberFromLabel(label = "") {
  const match = String(label).match(/^\s*(\d+)/);
  return match ? Number(match[1]) : null;
}
