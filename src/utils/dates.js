export function asDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value, fallback = "Não informada") {
  const date = asDate(value);
  return date
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date)
    : fallback;
}

export function formatDateTime(value, fallback = "Não informado") {
  const date = asDate(value);
  return date
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date)
    : fallback;
}

export function ageFromBirthDate(value, now = new Date()) {
  const birthDate = asDate(value);
  if (!birthDate) return null;
  let age = now.getFullYear() - birthDate.getFullYear();
  const hasNotHadBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() &&
      now.getDate() < birthDate.getDate());
  if (hasNotHadBirthday) age -= 1;
  return age;
}

export function toLocalDateInput(value = new Date()) {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}

export function dateFromInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}
