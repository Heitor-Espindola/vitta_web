import { dateFromInput, toLocalDateInput } from "./dates";

export function createInitialVaccinationForm(profile = {}, now = new Date()) {
  const professionalProfile = profile || {};
  return {
    vaccineId: "",
    doseLabel: "",
    appliedDate: toLocalDateInput(now),
    nextDoseDate: "",
    lot: "",
    manufacturer: "",
    facilityId:
      professionalProfile.facilityId || professionalProfile.unitId || "",
    facilityName:
      professionalProfile.facilityName || professionalProfile.unitName || "",
    notes: "",
  };
}

export function validateVaccinationForm({
  form,
  selectedVaccine,
  now = new Date(),
}) {
  const errors = {};
  const appliedAt = dateFromInput(form.appliedDate);
  const today = dateFromInput(toLocalDateInput(now));
  const earliestApplication = dateFromInput("1900-01-01");

  if (!selectedVaccine?.id || !selectedVaccine?.name?.trim()) {
    errors.vaccineId = "Selecione uma vacina do catálogo.";
  }
  if (!form.doseLabel.trim()) errors.doseLabel = "Informe a dose aplicada.";
  if (!appliedAt) {
    errors.appliedDate = "Informe uma data de aplicação válida.";
  } else if (appliedAt < earliestApplication) {
    errors.appliedDate = "Informe uma data de aplicação a partir de 1900.";
  } else if (appliedAt > today) {
    errors.appliedDate = "A data de aplicação não pode estar no futuro.";
  }

  if (form.nextDoseDate) {
    const nextDoseAt = dateFromInput(form.nextDoseDate);
    if (!nextDoseAt || nextDoseAt.getFullYear() > 2100) {
      errors.nextDoseDate = "Informe uma data válida para a próxima dose.";
    } else if (appliedAt && nextDoseAt < appliedAt) {
      errors.nextDoseDate =
        "A próxima dose não pode ser anterior à aplicação.";
    }
  }

  return errors;
}

export function createSubmissionGuard() {
  let submitting = false;
  return async (operation) => {
    if (submitting) return false;
    submitting = true;
    try {
      await operation();
      return true;
    } finally {
      submitting = false;
    }
  };
}
