import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { registerVaccination } from "../services/vaccinationService";
import { watchVaccines } from "../services/vaccineService";
import { toLocalDateInput } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";
import {
  createInitialVaccinationForm,
  createSubmissionGuard,
  validateVaccinationForm,
} from "../utils/vaccinationForm";

export default function VaccinationForm({ patient, onCancel, onSaved }) {
  const { firebaseUser, profile } = useAuth();
  const { showToast } = useToast();
  const [vaccines, setVaccines] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [form, setForm] = useState(() =>
    createInitialVaccinationForm(profile),
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const formElementRef = useRef(null);
  const submitOnce = useRef(createSubmissionGuard()).current;

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
    const next = validateVaccinationForm({ form, selectedVaccine });
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() =>
        formElementRef.current
          ?.querySelector('[aria-invalid="true"]')
          ?.focus(),
      );
      return false;
    }
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    await submitOnce(async () => {
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
          title: "Aplicação registrada com sucesso.",
          message: `${selectedVaccine.name} • ${form.doseLabel.trim()}`,
        });
        onSaved({
          id: document.id,
          vaccineName: selectedVaccine.name,
          doseLabel: form.doseLabel.trim(),
          appliedDate: form.appliedDate,
        });
      } catch (error) {
        showToast({
          tone: "error",
          title: "Não foi possível registrar a aplicação",
          message: friendlyFirebaseError(
            error,
            "Revise os dados e confirme se o atendimento continua autorizado.",
          ),
        });
      } finally {
        setSaving(false);
      }
    });
  }

  return (
    <form
      className="professional-form"
      onSubmit={handleSubmit}
      noValidate
      ref={formElementRef}
      aria-busy={saving}
    >
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
            aria-describedby={
              errors.vaccineId ? "vaccine-id-error" : "vaccine-description"
            }
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
          {errors.vaccineId ? (
            <small className="field__error" id="vaccine-id-error">
              {errors.vaccineId}
            </small>
          ) : selectedVaccine?.description ? (
            <small id="vaccine-description">{selectedVaccine.description}</small>
          ) : null}
        </label>

        <label className="field">
          <span>Dose *</span>
          <input
            value={form.doseLabel}
            onChange={(event) => update("doseLabel", event.target.value)}
            placeholder="Ex.: 1ª dose"
            maxLength={40}
            aria-invalid={Boolean(errors.doseLabel)}
            aria-describedby={errors.doseLabel ? "dose-label-error" : undefined}
            list="dose-label-options"
          />
          <datalist id="dose-label-options">
            <option value="Dose única" />
            <option value="1ª dose" />
            <option value="2ª dose" />
            <option value="Reforço" />
          </datalist>
          {errors.doseLabel ? (
            <small className="field__error" id="dose-label-error">
              {errors.doseLabel}
            </small>
          ) : null}
        </label>

        <label className="field">
          <span>Data da aplicação *</span>
          <input
            type="date"
            value={form.appliedDate}
            min="1900-01-01"
            max={toLocalDateInput()}
            onChange={(event) => update("appliedDate", event.target.value)}
            aria-invalid={Boolean(errors.appliedDate)}
            aria-describedby={
              errors.appliedDate ? "applied-date-error" : undefined
            }
          />
          {errors.appliedDate ? (
            <small className="field__error" id="applied-date-error">
              {errors.appliedDate}
            </small>
          ) : null}
        </label>

        <label className="field">
          <span>Próxima dose</span>
          <input
            type="date"
            value={form.nextDoseDate}
            min={form.appliedDate || undefined}
            max="2100-12-31"
            onChange={(event) => update("nextDoseDate", event.target.value)}
            aria-invalid={Boolean(errors.nextDoseDate)}
            aria-describedby={
              errors.nextDoseDate ? "next-dose-date-error" : undefined
            }
          />
          {errors.nextDoseDate ? (
            <small className="field__error" id="next-dose-date-error">
              {errors.nextDoseDate}
            </small>
          ) : null}
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
          <span>Unidade de atendimento</span>
          <input
            value={form.facilityName}
            onChange={(event) => update("facilityName", event.target.value)}
            placeholder="Ex.: UBS Central"
            maxLength={140}
          />
          <small>
            Preenchida automaticamente quando vinculada ao seu perfil.
          </small>
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
