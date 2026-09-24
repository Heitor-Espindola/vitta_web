import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { watchBatches } from "../services/batchService";
import { watchPatients } from "../services/patientService";
import {
    editApplication,
    registerVaccination,
} from "../services/vaccinationService";
import { watchVaccines } from "../services/vaccineService";
import { toLocalDateInput } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

const today = toLocalDateInput();

function initialState(initialApplication, patient) {
    return {
        patientId: initialApplication?.patientId || patient?.id || patient?.personId || "",
        vaccineId: initialApplication?.vaccineId || "",
        batchId: initialApplication?.batchId || "",
        applicationDate: initialApplication?.applicationDate
            ? new Date(initialApplication.applicationDate).toISOString().slice(0, 10)
            : today,
        doseNumber:
            initialApplication?.doseNumber != null
                ? String(initialApplication.doseNumber)
                : "",
        notes: initialApplication?.notes || "",
    };
}

export default function ApplicationForm({
    patient = null,
    initialApplication = null,
    onCancel,
    onSaved,
}) {
    const { firebaseUser, isAdmin } = useAuth();
    const { showToast } = useToast();
    const [patients, setPatients] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState(() => initialState(initialApplication, patient));
    const [saving, setSaving] = useState(false);

    const editing = Boolean(initialApplication?.id);
    const fixedPatient = Boolean(patient?.id || patient?.personId) || editing;

    useEffect(() => {
        let patientsReady = false;
        let vaccinesReady = false;
        let batchesReady = false;

        const checkReady = () => {
            if (patientsReady && vaccinesReady && batchesReady) {
                setLoadingOptions(false);
            }
        };

        const unsubscribePatients = watchPatients(
            (data) => {
                setPatients(data);
                patientsReady = true;
                checkReady();
            },
            (loadError) => {
                setError(friendlyFirebaseError(loadError, loadError.message));
                patientsReady = true;
                checkReady();
            },
            { isAdmin },
        );
        const unsubscribeVaccines = watchVaccines(
            (data) => {
                setVaccines(data);
                vaccinesReady = true;
                checkReady();
            },
            (loadError) => {
                setError(friendlyFirebaseError(loadError, loadError.message));
                vaccinesReady = true;
                checkReady();
            },
        );
        const unsubscribeBatches = watchBatches(
            (data) => {
                setBatches(data);
                batchesReady = true;
                checkReady();
            },
            (loadError) => {
                setError(friendlyFirebaseError(loadError, loadError.message));
                batchesReady = true;
                checkReady();
            },
        );

        return () => {
            unsubscribePatients?.();
            unsubscribeVaccines?.();
            unsubscribeBatches?.();
        };
    }, [isAdmin]);

    function update(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;

        if (!form.patientId || !form.vaccineId || !form.applicationDate || (!editing && !form.batchId)) {
            setError("Paciente, vacina, lote e data da aplicação são obrigatórios.");
            return;
        }

        if (form.applicationDate > today) {
            setError("A data da aplicação não pode estar no futuro.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            if (editing) {
                await editApplication(initialApplication.id, {
                    doseNumber: form.doseNumber,
                    doseLabel: form.doseNumber
                        ? `${Number(form.doseNumber)}ª dose`
                        : null,
                    notes: form.notes,
                });
                showToast({
                    tone: "success",
                    title: "Aplicação atualizada",
                    message: "O registro foi alterado no banco SQL.",
                });
            } else {
                await registerVaccination({
                    patientId: form.patientId,
                    vaccineId: form.vaccineId,
                    batchId: form.batchId,
                    applicationDate: form.applicationDate,
                    doseNumber: form.doseNumber,
                    notes: form.notes,
                    firebaseUser,
                });
                showToast({
                    tone: "success",
                    title: "Aplicação registrada",
                    message: "O histórico foi atualizado em tempo real.",
                });
            }
            onSaved?.();
        } catch (saveError) {
            setError(friendlyFirebaseError(saveError, saveError.message));
            showToast({
                tone: "error",
                title: editing ? "Não foi possível atualizar" : "Não foi possível registrar",
                message: friendlyFirebaseError(saveError, saveError.message),
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="professional-form" onSubmit={handleSubmit} noValidate>
            {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

            <div className="form-grid">
                <label className="field field--span-2">
                    <span>Paciente *</span>
                    <select
                        value={form.patientId}
                        onChange={(event) => update("patientId", event.target.value)}
                        disabled={fixedPatient || loadingOptions || saving}
                    >
                        <option value="">
                            {loadingOptions ? "Carregando pacientes..." : "Selecione o paciente"}
                        </option>
                        {patients.map((item) => (
                            <option value={item.id} key={item.id}>
                                {item.name} — {item.maskedCpf}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="field field--span-2">
                    <span>Vacina *</span>
                    <select
                        value={form.vaccineId}
                        onChange={(event) => {
                            setForm((current) => ({
                                ...current,
                                vaccineId: event.target.value,
                                batchId: "",
                            }));
                            setError("");
                        }}
                        disabled={editing || loadingOptions || saving}
                    >
                        <option value="">Selecione a vacina</option>
                        {vaccines.map((item) => (
                            <option value={item.id} key={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </label>

                {form.vaccineId ? (
                    <label className="field field--span-2">
                        <span>Lote *</span>
                        <select
                            value={form.batchId}
                            onChange={(event) => update("batchId", event.target.value)}
                            disabled={editing || loadingOptions || saving}
                        >
                            <option value="">Selecione o lote</option>
                            {batches
                                .filter(
                                    (item) =>
                                        item.vaccine?.id === form.vaccineId &&
                                        (editing || Number(item.currentQuantity) > 0),
                                )
                                .map((item) => (
                                    <option value={item.id} key={item.id}>
                                        {item.batchCode} — {item.currentQuantity} un.
                                    </option>
                                ))}
                        </select>
                    </label>
                ) : null}

                <label className="field">
                    <span>Data da aplicação *</span>
                    <input
                        type="date"
                        value={form.applicationDate}
                        max={today}
                        onChange={(event) => update("applicationDate", event.target.value)}
                        disabled={editing || saving}
                    />
                </label>

                <label className="field">
                    <span>Número da dose</span>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={form.doseNumber}
                        onChange={(event) => update("doseNumber", event.target.value)}
                        placeholder="Ex.: 1"
                        disabled={saving}
                    />
                </label>

                <label className="field field--span-2">
                    <span>Observações</span>
                    <textarea
                        value={form.notes}
                        onChange={(event) => update("notes", event.target.value)}
                        placeholder="Inclua somente informações relevantes ao registro."
                        rows={4}
                        maxLength={600}
                        disabled={saving}
                    />
                    <small>{form.notes.length}/600 caracteres</small>
                </label>
            </div>

            <div className="form-actions">
                <button className="button button--secondary" type="button" onClick={onCancel} disabled={saving}>
                    Cancelar
                </button>
                <button className="button button--primary" type="submit" disabled={saving}>
                    {saving ? <span className="button-spinner" /> : <CheckCircle2 size={18} />}
                    {saving ? "Salvando..." : editing ? "Salvar alterações" : "Registrar aplicação"}
                </button>
            </div>
        </form>
    );
}
