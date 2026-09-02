import { asDate, dateFromInput } from "./dates";

export const ReportPeriod = Object.freeze({
  today: "today",
  last7Days: "last7Days",
  last30Days: "last30Days",
  custom: "custom",
});

function startOfDay(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function endOfDay(value) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function reportPeriodBounds({
  period,
  customStart = "",
  customEnd = "",
  now = new Date(),
}) {
  const today = startOfDay(now);
  if (period === ReportPeriod.today) {
    return { start: today, end: endOfDay(today), error: "" };
  }
  if (period === ReportPeriod.last7Days) {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6),
      end: endOfDay(today),
      error: "",
    };
  }
  if (period === ReportPeriod.last30Days) {
    return {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29),
      end: endOfDay(today),
      error: "",
    };
  }

  const start = dateFromInput(customStart);
  const end = dateFromInput(customEnd);
  if (!start || !end) {
    return {
      start: null,
      end: null,
      error: "Informe as datas inicial e final do período.",
    };
  }
  if (start > end) {
    return {
      start: null,
      end: null,
      error: "A data inicial não pode ser posterior à data final.",
    };
  }
  return { start: startOfDay(start), end: endOfDay(end), error: "" };
}

function increment(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function sortedCounts(map) {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) =>
      second.count === first.count
        ? first.label.localeCompare(second.label, "pt-BR")
        : second.count - first.count,
    );
}

export function buildProfessionalReport(
  records = [],
  {
    period = ReportPeriod.last30Days,
    customStart = "",
    customEnd = "",
    now = new Date(),
  } = {},
) {
  const bounds = reportPeriodBounds({ period, customStart, customEnd, now });
  if (bounds.error) {
    return {
      error: bounds.error,
      total: 0,
      today: 0,
      differentVaccines: 0,
      byVaccine: [],
      byFacility: [],
      recentActivity: [],
    };
  }

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const periodRecords = records
    .filter((record) => {
      const appliedAt = asDate(record.appliedAt);
      return appliedAt && appliedAt >= bounds.start && appliedAt <= bounds.end;
    })
    .sort((first, second) => asDate(second.appliedAt) - asDate(first.appliedAt));
  const vaccineCounts = new Map();
  const facilityCounts = new Map();
  periodRecords.forEach((record) => {
    increment(vaccineCounts, record.vaccineName);
    increment(facilityCounts, record.facilityName);
  });

  return {
    error: "",
    total: periodRecords.length,
    today: periodRecords.filter((record) => {
      const appliedAt = asDate(record.appliedAt);
      return appliedAt >= todayStart && appliedAt <= todayEnd;
    }).length,
    differentVaccines: vaccineCounts.size,
    byVaccine: sortedCounts(vaccineCounts),
    byFacility: sortedCounts(facilityCounts),
    recentActivity: periodRecords.slice(0, 6).map((record) => ({
      vaccineName: record.vaccineName || "",
      doseLabel: record.doseLabel || "",
      appliedAt: record.appliedAt,
      facilityName: record.facilityName || "",
    })),
  };
}
