import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { registerVaccination } from "../services/vaccinationService";
import { watchVaccines } from "../services/vaccineService";
import { toLocalDateInput } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

const initialForm = {
  vaccineId: "",
  doseLabel: "",
  appliedDate: toLocalDateInput(),
  nextDoseDate: "",
  lot: "",
  manufacturer: "",
  facilityName: "",
  notes: "",
};

export default function VaccinationForm({ patient, onCancel, onSaved }) {
  const { firebaseUser } = useAuth();
  const { showToast } = useToast();
  const [vaccines, setVaccines] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(
    () =>
      watchVaccines(
        (data) => {
          setVaccines(data.filter((vaccine) => vaccine.active));
          setCatalogLoading(false);
        },
        (error) => {
          setCatalogError(friendlyFirebaseError(error));
          setCatalogLoading(false);
        },
      ),
    [],
  );

  const selectedVaccine = useMemo(
    () => vaccines.find((vaccine) => vaccine.id === form.vaccineId),
    [vaccines, form.vaccineId],
  );

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validate() {
    const next = {};
    if (!selectedVaccine) next.vaccineId = "Selecione uma vacina do catálogo.";
    if (!form.doseLabel.trim()) next.doseLabel = "Informe a dose aplicada.";
    if (!form.appliedDate) next.appliedDate = "Informe a data da aplicação.";
    if (form.appliedDate > toLocalDateInput()) {
      next.appliedDate = "A data de aplicação não pode estar no futuro.";
    }
    if (form.nextDoseDate && form.nextDoseDate <= form.appliedDate) {
      next.nextDoseDate = "A próxima dose deve ser posterior à aplicação.";
    }
    if (!form.facilityName.trim()) {
      next.facilityName = "Informe a unidade de atendimento.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || !validate()) return;
    setSaving(true);
    try {
      const document = await registerVaccination({
        patientId: patient.personId,
        professionalUid: firebaseUser.uid,
        vaccine: selectedVaccine,
        ...form,
      });
      showToast({
        tone: "success",
        title: "Aplicação registrada",
        message: `${selectedVaccine.name} • ${form.doseLabel}`,
      });
      onSaved({
        id: document.id,
        vaccineName: selectedVaccine.name,
        doseLabel: form.doseLabel,
        appliedDate: form.appliedDate,
      });
    } catch (error) {
      showToast({
        tone: "error",
        title: "Não foi possível registrar",
        message: friendlyFirebaseError(
          error,
          "Revise os dados e confirme sua permissão de atendimento.",
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="professional-form" onSubmit={handleSubmit} noValidate>
      <div className="form-patient-strip">
        <span>{patient.name.slice(0, 1).toUpperCase()}</span>
        <div>
          <strong>{patient.name}</strong>
          <small>{patient.maskedCpf}</small>
        </div>
        <em>
          <ShieldCheck size={15} /> Paciente validado
        </em>
      </div>

      {catalogError ? <div className="inline-alert inline-alert--error">{catalogError}</div> : null}

      <div className="form-grid">
        <label className="field field--span-2">
          <span>Vacina *</span>
          <select
            value={form.vaccineId}
            onChange={(event) => update("vaccineId", event.target.value)}
            disabled={catalogLoading}
            aria-invalid={Boolean(errors.vaccineId)}
          >
            <option value="">
              {catalogLoading ? "Carregando catálogo..." : "Selecione a vacina"}
            </option>
            {vaccines.map((vaccine) => (
              <option value={vaccine.id} key={vaccine.id}>
                {vaccine.name}
              </option>
            ))}
          </select>
          {errors.vaccineId ? <small className="field__error">{errors.vaccineId}</small> : null}
        </label>

        <label className="field">
          <span>Dose *</span>
          <input
            value={form.doseLabel}
            onChange={(event) => update("doseLabel", event.target.value)}
            placeholder="Ex.: 1ª dose"
            maxLength={40}
            aria-invalid={Boolean(errors.doseLabel)}
          />
          {errors.doseLabel ? <small className="field__error">{errors.doseLabel}</small> : null}
        </label>

        <label className="field">
          <span>Data da aplicação *</span>
          <input
            type="date"
            value={form.appliedDate}
            max={toLocalDateInput()}
            onChange={(event) => update("appliedDate", event.target.value)}
            aria-invalid={Boolean(errors.appliedDate)}
          />
          {errors.appliedDate ? <small className="field__error">{errors.appliedDate}</small> : null}
        </label>

        <label className="field">
          <span>Próxima dose</span>
          <input
            type="date"
            value={form.nextDoseDate}
            min={form.appliedDate || undefined}
            onChange={(event) => update("nextDoseDate", event.target.value)}
            aria-invalid={Boolean(errors.nextDoseDate)}
          />
          {errors.nextDoseDate ? <small className="field__error">{errors.nextDoseDate}</small> : null}
        </label>

        <label className="field">
          <span>Lote</span>
          <input
            value={form.lot}
            onChange={(event) => update("lot", event.target.value)}
            placeholder="Ex.: BCG-2026-08"
            maxLength={80}
          />
        </label>

        <label className="field">
          <span>Fabricante</span>
          <input
            value={form.manufacturer}
            onChange={(event) => update("manufacturer", event.target.value)}
            placeholder="Fabricante informado no frasco"
            maxLength={120}
          />
        </label>

        <label className="field field--span-2">
          <span>Unidade de atendimento *</span>
          <input
            value={form.facilityName}
            onChange={(event) => update("facilityName", event.target.value)}
            placeholder="Ex.: UBS Central"
            maxLength={140}
            aria-invalid={Boolean(errors.facilityName)}
          />
          {errors.facilityName ? <small className="field__error">{errors.facilityName}</small> : null}
        </label>

        <label className="field field--span-2">
          <span>Observações</span>
          <textarea
            value={form.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Inclua somente informações relevantes ao registro."
            rows={3}
            maxLength={600}
          />
          <small>{form.notes.length}/600 caracteres</small>
        </label>
      </div>

      <div className="form-actions">
        <button className="button button--secondary" type="button" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button className="button button--primary" type="submit" disabled={saving || catalogLoading}>
          {saving ? <span className="button-spinner" /> : <CheckCircle2 size={18} />}
          {saving ? "Registrando..." : "Registrar aplicação"}
        </button>
      </div>
    </form>
  );
}
