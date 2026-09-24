import { ClipboardPlus, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import VaccinationDetail from "../components/VaccinationDetail";
import ApplicationForm from "../components/ApplicationForm";
import {
  Modal,
  PageHeader,
  SkeletonRows,
  StatePanel,
  StatusBadge,
} from "../components/ui";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { removeApplication, watchApplications } from "../services/vaccinationService";
import { formatDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

export default function Aplicacoes() {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    return watchApplications(
      (data) => {
        setRecords(data);
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
    if (!term) return records;
    return records.filter((record) =>
      [
        record.patientName,
        record.patientCpf,
        record.vaccineName,
        record.batchCode,
        record.ubsName,
        record.professionalName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [records, search]);

  function openCreate() {
    setEditingRecord(null);
    setFormOpen(true);
  }

  function openEdit(record) {
    setEditingRecord(record);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingRecord(null);
  }

  async function handleDelete(record) {
    if (deletingId) return;
    if (!window.confirm(`Anular o registro de ${record.vaccineName} de ${record.patientName}? O histórico será preservado.`)) {
      return;
    }
    const reason = window.prompt("Informe o motivo da anulação:");
    if (reason === null) return;

    setDeletingId(record.id);
    try {
      await removeApplication(record.id, reason);
      showToast({
        tone: "success",
        title: "Aplicação anulada",
        message: "O histórico foi preservado e marcado como anulado.",
      });
      if (selectedRecord?.id === record.id) setSelectedRecord(null);
    } catch (deleteError) {
      showToast({
        tone: "error",
        title: "Não foi possível anular",
        message: friendlyFirebaseError(deleteError, deleteError.message),
      });
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Registros oficiais"
        title="Aplicações"
        description={isAdmin
          ? "Gerencie todas as aplicações registradas no Vitta."
          : "Consulte suas aplicações e registre atendimentos autorizados."}
        actions={
          <button className="button button--primary" type="button" onClick={openCreate}>
            <Plus size={18} /> Nova aplicação
          </button>
        }
      />

      <section className="content-card">
        <div className="toolbar">
          <div className="input-with-icon toolbar__search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por paciente, vacina, lote, UBS ou profissional"
            />
          </div>
          <span className="toolbar__count">{filtered.length} registro(s)</span>
        </div>

        {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

        {loading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length === 0 ? (
          <StatePanel
            title={records.length ? "Nenhum resultado encontrado" : "Nenhuma aplicação registrada"}
            description={
              records.length
                ? "Ajuste o termo de busca."
                : "Cadastre a primeira aplicação para começar o histórico."
            }
            action={
              !records.length ? (
                <button className="button button--primary" type="button" onClick={openCreate}>
                  <ClipboardPlus size={17} /> Registrar aplicação
                </button>
              ) : null
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Vacina</th>
                  <th>Dose</th>
                  <th>Data</th>
                  <th>UBS</th>
                  <th>Lote</th>
                  <th>Status</th>
                  <th><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.patientName}</strong>
                      <small>{record.patientCpf || "CPF não informado"}</small>
                    </td>
                    <td>
                      <strong>{record.vaccineName}</strong>
                      <small>{record.manufacturer || "Fabricante não informado"}</small>
                    </td>
                    <td>{record.doseLabel}</td>
                    <td>{formatDate(record.applicationDate)}</td>
                    <td>{record.ubsName || "Não informada"}</td>
                    <td>{record.batchCode || "—"}</td>
                    <td><StatusBadge status={record.voidedAt ? "danger" : "active"}>{record.voidedAt ? "Anulada" : "Registrada"}</StatusBadge></td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-button" type="button" onClick={() => setSelectedRecord(record)} title="Detalhes">
                          <Eye size={17} />
                        </button>
                        {isAdmin && !record.voidedAt ? <button className="icon-button" type="button" onClick={() => openEdit(record)} title="Editar campos permitidos">
                          <Pencil size={17} />
                        </button> : null}
                        {isAdmin ? <button
                          className="icon-button"
                          type="button"
                          onClick={() => handleDelete(record)}
                          disabled={Boolean(record.voidedAt) || deletingId === record.id}
                          title={record.voidedAt ? "Aplicação já anulada" : "Anular"}
                        >
                          {deletingId === record.id ? <span className="button-spinner" /> : <Trash2 size={17} />}
                        </button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Detalhes da aplicação"
        description="Registro oficial armazenado no SQL Connect."
      >
        <VaccinationDetail record={selectedRecord} />
      </Modal>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingRecord ? "Editar aplicação" : "Nova aplicação"}
        description="O registro será atualizado no banco e a lista será sincronizada sem recarregar a página."
        wide
      >
        <ApplicationForm
          initialApplication={editingRecord}
          onCancel={closeForm}
          onSaved={closeForm}
        />
      </Modal>

      <Link className="text-link" to="/pacientes">
        <ClipboardPlus size={16} /> Registrar aplicação a partir de um paciente
      </Link>
    </div>
  );
}
