import { CalendarCheck2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "../context/ToastContext";
import { addAppointment, editAppointment } from "../services/appointmentService";
import { watchPatients } from "../services/patientService";
import { watchVaccines } from "../services/vaccineService";
import { watchUBS } from "../services/ubsService";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

function toDateTimeInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function initialState(appointment) {
    return {
        patientId: appointment?.patientId || "",
        vaccineId: appointment?.vaccineId || "",
        ubsId: appointment?.ubsId || "",
        scheduledAt: toDateTimeInput(appointment?.scheduledAt),
        status: appointment?.status || "SCHEDULED",
        notes: appointment?.notes || "",
    };
}

export default function AppointmentForm({ initialAppointment = null, onCancel, onSaved }) {
    const { showToast } = useToast();
    const [patients, setPatients] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    const [ubs, setUbs] = useState([]);
    const [patientSearch, setPatientSearch] = useState("");
    const [form, setForm] = useState(() => initialState(initialAppointment));
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const editing = Boolean(initialAppointment?.id);

    useEffect(() => {
        let patientsReady = false;
        let vaccinesReady = false;
        let ubsReady = false;

        const done = () => setLoading(!(patientsReady && vaccinesReady && ubsReady));

        const unsubscribePatients = watchPatients((data) => {
            setPatients(data);
            const selected = data.find((item) => item.id === initialAppointment?.patientId);
            if (selected) setPatientSearch(`${selected.name} — ${selected.maskedCpf}`);
            patientsReady = true;
            done();
        }, (loadError) => {
            setError(friendlyFirebaseError(loadError, loadError.message));
            patientsReady = true;
            done();
        });

        const unsubscribeVaccines = watchVaccines((data) => {
            setVaccines(data);
            vaccinesReady = true;
            done();
        }, (loadError) => {
            setError(friendlyFirebaseError(loadError, loadError.message));
            vaccinesReady = true;
            done();
        });

        const unsubscribeUbs = watchUBS((data) => {
            setUbs(data);
            ubsReady = true;
            done();
        }, (loadError) => {
            setError(friendlyFirebaseError(loadError, loadError.message));
            ubsReady = true;
            done();
        });

        return () => {
            unsubscribePatients?.();
            unsubscribeVaccines?.();
            unsubscribeUbs?.();
        };
    }, [initialAppointment?.patientId]);

    const matchingPatients = useMemo(() => {
        const term = patientSearch.trim().toLocaleLowerCase("pt-BR");
        if (!term) return patients.slice(0, 20);
        return patients
            .filter((patient) =>
                [patient.name, patient.maskedCpf, patient.cpf]
                    .filter(Boolean)
                    .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term)),
            )
            .slice(0, 20);
    }, [patientSearch, patients]);

    function setField(field, value) {
        setForm((current) => ({ ...current, [field]: value }));
        setError("");
    }

    function selectPatient(value) {
        const patient = patients.find(
            (item) => `${item.name} — ${item.maskedCpf}` === value,
        );
        if (patient) {
            setForm((current) => ({ ...current, patientId: patient.id }));
            setPatientSearch(`${patient.name} — ${patient.maskedCpf}`);
        } else {
            setForm((current) => ({ ...current, patientId: "" }));
            setPatientSearch(value);
        }
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;

        if (!form.patientId) {
            setError("Selecione um paciente pela busca.");
            return;
        }
        if (!form.vaccineId) {
            setError("Selecione a vacina.");
            return;
        }
        if (!form.scheduledAt) {
            setError("Informe a data e hora do agendamento.");
            return;
        }

        setSaving(true);
        try {
            if (editing) {
                await editAppointment(initialAppointment.id, {
                    ...form,
                    createdAt: initialAppointment.createdAt,
                });
                showToast({
                    tone: "success",
                    title: "Agendamento atualizado",
                    message: "A agenda foi sincronizada em tempo real.",
                });
            } else {
                await addAppointment(form);
                showToast({
                    tone: "success",
                    title: "Agendamento criado",
                    message: "O novo atendimento apareceu na agenda.",
                });
            }
            onSaved?.();
        } catch (saveError) {
            const message = friendlyFirebaseError(saveError, saveError.message);
            setError(message);
            showToast({
                tone: "error",
                title: editing ? "Não foi possível alterar" : "Não foi possível agendar",
                message,
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="modal__body professional-form" onSubmit={handleSubmit} noValidate>
            {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

            <div className="form-grid">
                <label className="field field--span-2">
                    <span>Paciente *</span>
                    <input
                        list="appointment-patient-options"
                        value={patientSearch}
                        onChange={(event) => selectPatient(event.target.value)}
                        placeholder="Digite nome ou CPF"
                        disabled={loading || saving}
                        autoComplete="off"
                    />
                    <datalist id="appointment-patient-options">
                        {matchingPatients.map((patient) => (
                            <option key={patient.id} value={`${patient.name} — ${patient.maskedCpf}`} />
                        ))}
                    </datalist>
                    <small>Pesquise pelo nome ou CPF; não é necessário decorar o ID do paciente.</small>
                </label>

                <label className="field field--span-2">
                    <span>Vacina *</span>
                    <select value={form.vaccineId} onChange={(event) => setField("vaccineId", event.target.value)} disabled={loading || saving}>
                        <option value="">Selecione a vacina</option>
                        {vaccines.map((vaccine) => (
                            <option key={vaccine.id} value={vaccine.id}>{vaccine.name}</option>
                        ))}
                    </select>
                </label>

                <label className="field">
                    <span>Data e hora *</span>
                    <input type="datetime-local" value={form.scheduledAt} onChange={(event) => setField("scheduledAt", event.target.value)} disabled={saving} />
                </label>

                <label className="field">
                    <span>Status</span>
                    <select value={form.status} onChange={(event) => setField("status", event.target.value)} disabled={saving}>
                        <option value="SCHEDULED">Agendado</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="CANCELLED">Cancelado</option>
                        <option value="OVERDUE">Atrasado</option>
                    </select>
                </label>

                <label className="field field--span-2">
                    <span>UBS</span>
                    <select value={form.ubsId} onChange={(event) => setField("ubsId", event.target.value)} disabled={loading || saving}>
                        <option value="">Sem UBS definida</option>
                        {ubs.map((unit) => (
                            <option key={unit.id} value={unit.id}>{unit.name}{unit.cidade ? ` — ${unit.cidade}` : ""}</option>
                        ))}
                    </select>
                </label>

                <label className="field field--span-2">
                    <span>Observações</span>
                    <textarea value={form.notes} onChange={(event) => setField("notes", event.target.value)} rows={4} maxLength={600} disabled={saving} />
                    <small>{form.notes.length}/600 caracteres</small>
                </label>
            </div>

            <div className="form-actions">
                <button className="button button--secondary" type="button" onClick={onCancel} disabled={saving}>Cancelar</button>
                <button className="button button--primary" type="submit" disabled={saving || loading}>
                    {saving ? <span className="button-spinner" /> : <CalendarCheck2 size={18} />}
                    {saving ? "Salvando..." : editing ? "Salvar alterações" : "Agendar atendimento"}
                </button>
            </div>
        </form>
    );
}
