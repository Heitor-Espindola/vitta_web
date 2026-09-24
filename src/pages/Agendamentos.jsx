import { CalendarCheck2, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AppointmentForm from "../components/AppointmentForm";
import { Modal, PageHeader, SkeletonRows, StatePanel, StatusBadge } from "../components/ui";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { removeAppointment, watchAppointments } from "../services/appointmentService";
import { formatDateTime } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

const statusLabels = {
    SCHEDULED: "Agendado",
    COMPLETED: "Concluído",
    CANCELLED: "Cancelado",
    OVERDUE: "Atrasado",
};

function badgeStatus(status) {
    if (status === "COMPLETED") return "active";
    if (status === "CANCELLED") return "error";
    if (status === "OVERDUE") return "warning";
    return "info";
}

export default function Agendamentos() {
    const { showToast } = useToast();
    const { isAdmin } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [deletingId, setDeletingId] = useState("");

    useEffect(() => {
        return watchAppointments(
            (data) => {
                setAppointments(data);
                setLoading(false);
                setError("");
            },
            (watchError) => {
                setError(friendlyFirebaseError(watchError, watchError.message));
                setLoading(false);
            },
            { isAdmin },
        );
    }, [isAdmin]);

    const filtered = useMemo(() => {
        const term = search.trim().toLocaleLowerCase("pt-BR");
        if (!term) return appointments;
        return appointments.filter((item) =>
            [item.patientName, item.patientCpf, item.vaccineName, item.ubsName, statusLabels[item.status]]
                .filter(Boolean)
                .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term)),
        );
    }, [appointments, search]);

    function openCreate() {
        setEditing(null);
        setFormOpen(true);
    }

    function openEdit(item) {
        setSelected(null);
        setEditing(item);
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditing(null);
    }

    async function handleDelete(item) {
        if (deletingId) return;
        if (!window.confirm(`Excluir o agendamento de ${item.patientName} para ${item.vaccineName}?`)) return;
        setDeletingId(item.id);
        try {
            await removeAppointment(item.id);
            showToast({ tone: "success", title: "Agendamento excluído", message: "A agenda foi atualizada em tempo real." });
        } catch (deleteError) {
            showToast({ tone: "error", title: "Não foi possível excluir", message: friendlyFirebaseError(deleteError, deleteError.message) });
        } finally {
            setDeletingId("");
        }
    }

    return (
        <div className="page-stack">
            <PageHeader
                eyebrow="Agenda de vacinação"
                title="Agendamentos"
                description="Organize os próximos atendimentos e acompanhe seus estados sem recarregar a página."
                actions={<button className="button button--primary" type="button" onClick={openCreate}><Plus size={18} /> Novo agendamento</button>}
            />

            <section className="content-card">
                <div className="toolbar">
                    <div className="input-with-icon toolbar__search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por paciente, CPF, vacina, UBS ou status" /></div>
                    <span className="toolbar__count">{filtered.length} agendamento(s)</span>
                </div>

                {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
                {loading ? <SkeletonRows rows={6} /> : filtered.length === 0 ? (
                    <StatePanel title={appointments.length ? "Nenhum resultado encontrado" : "Nenhum agendamento cadastrado"} description={appointments.length ? "Ajuste o termo de busca." : "Crie o primeiro atendimento agendado."} action={!appointments.length ? <button className="button button--primary" type="button" onClick={openCreate}><CalendarCheck2 size={17} /> Agendar atendimento</button> : null} />
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th>Paciente</th><th>Vacina</th><th>Data e hora</th><th>UBS</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
                            <tbody>
                                {filtered.map((item) => (
                                    <tr key={item.id}>
                                        <td><strong>{item.patientName}</strong><small>{item.patientCpf || "CPF não informado"}</small></td>
                                        <td>{item.vaccineName}</td>
                                        <td>{formatDateTime(item.scheduledAt)}</td>
                                        <td>{item.ubsName}</td>
                                        <td><StatusBadge status={badgeStatus(item.status)}>{statusLabels[item.status] || item.status}</StatusBadge></td>
                                        <td><div className="table-actions"><button className="icon-button" type="button" title="Detalhes" onClick={() => setSelected(item)}><Eye size={17} /></button>{isAdmin ? <button className="icon-button" type="button" title="Editar" onClick={() => openEdit(item)}><Pencil size={17} /></button> : null}{isAdmin ? <button className="icon-button" type="button" title="Excluir" disabled={deletingId === item.id} onClick={() => handleDelete(item)}>{deletingId === item.id ? <span className="button-spinner" /> : <Trash2 size={17} />}</button> : null}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Detalhes do agendamento" description="Dados armazenados no SQL Connect.">
                {selected ? <div className="record-detail"><dl><div><dt>Paciente</dt><dd>{selected.patientName} • {selected.patientCpf}</dd></div><div><dt>Vacina</dt><dd>{selected.vaccineName}</dd></div><div><dt>Data e hora</dt><dd>{formatDateTime(selected.scheduledAt)}</dd></div><div><dt>UBS</dt><dd>{selected.ubsName}</dd></div><div><dt>Status</dt><dd>{statusLabels[selected.status] || selected.status}</dd></div></dl>{selected.notes ? <div className="record-detail__notes"><strong>Observações</strong><p>{selected.notes}</p></div> : null}</div> : null}
            </Modal>

            <Modal open={formOpen} onClose={closeForm} title={editing ? "Editar agendamento" : "Novo agendamento"} description="A alteração será sincronizada automaticamente na agenda." wide>
                <AppointmentForm initialAppointment={editing} onCancel={closeForm} onSaved={closeForm} />
            </Modal>
        </div>
    );
}
