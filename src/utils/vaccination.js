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

export function doseNumberFromLabel(label = "") {
  const match = String(label).match(/^\s*(\d+)/);
  return match ? Number(match[1]) : null;
}
