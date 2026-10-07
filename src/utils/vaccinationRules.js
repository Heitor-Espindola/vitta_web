import { asDate, dateFromInput } from "./dates";

function startOfDay(value) {
  const date = asDate(value);
  if (!date) return null;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function ageInDays(birthDate, referenceDate) {
  const birth = startOfDay(birthDate);
  const reference = startOfDay(referenceDate);

  if (!birth || !reference || reference < birth) {
    return null;
  }

  return Math.floor(
    (reference.getTime() - birth.getTime()) / 86_400_000,
  );
}

function ageInMonths(birthDate, referenceDate) {
  const birth = startOfDay(birthDate);
  const reference = startOfDay(referenceDate);

  if (!birth || !reference || reference < birth) {
    return null;
  }

  let months =
    (reference.getFullYear() - birth.getFullYear()) * 12 +
    (reference.getMonth() - birth.getMonth());

  if (reference.getDate() < birth.getDate()) {
    months -= 1;
  }

  return months;
}

function hasName(vaccine, ...terms) {
  const text = [
    vaccine?.id,
    vaccine?.name,
    vaccine?.shortName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("pt-BR");

  return terms.some((term) => text.includes(term));
}

function isAnnualVaccine(vaccine) {
  return (
    hasName(vaccine, "influenza", "gripe") ||
    vaccine?.doseSchedule?.some?.((item) =>
      String(item).toLocaleLowerCase("pt-BR").includes("anual"),
    )
  );
}

function ageError(vaccine, patient, applicationDate, doseNumber) {
  if (!patient?.birthDate || !applicationDate || !vaccine) {
    return null;
  }

  const days = ageInDays(patient.birthDate, applicationDate);
  const months = ageInMonths(patient.birthDate, applicationDate);

  if (days === null || months === null) {
    return "Não foi possível calcular a idade do paciente.";
  }

  /*
   * Regras etárias inequívocas da rotina.
   * Exceções por condição clínica, gestação, situação epidemiológica
   * ou grupo especial não são bloqueadas aqui.
   */

  if (vaccine.id === "bcg" && days > 1826) {
    return "Vacina não permitida para a idade: BCG é indicada na rotina até 4 anos, 11 meses e 29 dias.";
  }

  if (vaccine.id === "rotavirus") {
    if (doseNumber === 1 && (days < 45 || days > 364)) {
      return "Vacina não permitida para a idade: a 1ª dose de rotavírus está fora da faixa etária permitida.";
    }

    if (doseNumber === 2 && (days < 105 || days > 729)) {
      return "Vacina não permitida para a idade: a 2ª dose de rotavírus está fora da faixa etária permitida.";
    }
  }

  if (vaccine.id === "influenza" && months < 6) {
    return "Vacina não permitida para a idade: influenza é indicada a partir de 6 meses.";
  }

  if (
    ["pentavalente", "dtp"].includes(vaccine.id) &&
    days >= 2557
  ) {
    return "Vacina não permitida para a idade: este esquema infantil não é indicado para essa faixa etária.";
  }

  if (vaccine.id === "meningo_c" && days > 1826) {
    return "Vacina não permitida para a idade: meningocócica C não faz parte do esquema rotineiro acima dessa faixa etária.";
  }

  if (vaccine.id === "pneumo_10" && days > 1826) {
    return "Vacina não permitida para a idade: pneumocócica 10-valente não faz parte do esquema rotineiro acima dessa faixa etária.";
  }

  if (vaccine.id === "vip" && days > 1826) {
    return "Vacina não permitida para a idade: este esquema infantil de VIP não é indicado para essa faixa etária.";
  }

  return null;
}

function normalizeDoseNumber(application, fallback) {
  return Number.isInteger(application?.doseNumber) && application.doseNumber > 0
    ? application.doseNumber
    : fallback;
}

export function getVaccinationDecision({
  patient,
  vaccine,
  applications = [],
  applicationDate,
  editingApplication = null,
}) {
  if (!patient || !vaccine || !applicationDate) {
    return {
      allowed: false,
      message: "Selecione o paciente, a vacina e a data da aplicação.",
      doseNumber: null,
      doseLabel: "",
    };
  }

  const referenceDate = dateFromInput(applicationDate);

  if (!referenceDate) {
    return {
      allowed: false,
      message: "Informe uma data de aplicação válida.",
      doseNumber: null,
      doseLabel: "",
    };
  }

  const history = applications
    .filter((application) => !application?.voidedAt)
    .filter((application) => application?.id !== editingApplication?.id)
    .filter((application) => application?.vaccineId === vaccine.id)
    .sort(
      (a, b) =>
        (asDate(a.applicationDate)?.getTime() || 0) -
        (asDate(b.applicationDate)?.getTime() || 0),
    );

  const annual = isAnnualVaccine(vaccine);

  if (annual) {
    const sameYear = history.find((application) => {
      const date = asDate(application.applicationDate);

      return (
        date &&
        date.getFullYear() === referenceDate.getFullYear()
      );
    });

    if (sameYear) {
      return {
        allowed: false,
        message: "Todas as doses previstas para esta temporada já estão cadastradas.",
        doseNumber: 1,
        doseLabel: "Dose anual",
      };
    }

    const ageMessage = ageError(
      vaccine,
      patient,
      referenceDate,
      1,
    );

    if (ageMessage) {
      return {
        allowed: false,
        message: ageMessage,
        doseNumber: 1,
        doseLabel: "Dose anual",
      };
    }

    return {
      allowed: true,
      message: "",
      doseNumber: 1,
      doseLabel: "Dose anual",
    };
  }

  const requiredDoses =
    Number(vaccine.requiredDoses) > 0
      ? Number(vaccine.requiredDoses)
      : 1;

  let highestDose = 0;

  history.forEach((application, index) => {
    highestDose = Math.max(
      highestDose,
      normalizeDoseNumber(application, index + 1),
    );
  });

  const nextDose = highestDose + 1;

  if (nextDose > requiredDoses) {
    return {
      allowed: false,
      message: "Todas as doses desta vacina já estão cadastradas.",
      doseNumber: null,
      doseLabel: "",
    };
  }

  const ageMessage = ageError(
    vaccine,
    patient,
    referenceDate,
    nextDose,
  );

  if (ageMessage) {
    return {
      allowed: false,
      message: ageMessage,
      doseNumber: nextDose,
      doseLabel:
        requiredDoses === 1
          ? "Dose única"
          : `${nextDose}ª dose`,
    };
  }

  if (history.length && Number(vaccine.intervalDays) > 0) {
    const previous =
      history[history.length - 1];

    const previousDate = asDate(previous.applicationDate);

    if (previousDate) {
      const earliestDate = new Date(previousDate);
      earliestDate.setDate(
        earliestDate.getDate() + Number(vaccine.intervalDays),
      );

      if (referenceDate < startOfDay(earliestDate)) {
        const formatted = new Intl.DateTimeFormat(
          "pt-BR",
        ).format(earliestDate);

        return {
          allowed: false,
          message: `A próxima dose só pode ser registrada a partir de ${formatted}.`,
          doseNumber: nextDose,
          doseLabel: `${nextDose}ª dose`,
        };
      }
    }
  }

  return {
    allowed: true,
    message: "",
    doseNumber: nextDose,
    doseLabel:
      requiredDoses === 1
        ? "Dose única"
        : `${nextDose}ª dose`,
  };
}