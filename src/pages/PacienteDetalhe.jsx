import {
  ArrowLeft,
  ClipboardPlus,
  History,
  Pencil,
  Syringe,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import VaccinationDetail from "../components/VaccinationDetail";
import VaccinationForm from "../components/VaccinationForm";
import {
  LoadingPanel,
  Modal,
  PageHeader,
  StatePanel,
  StatCard,
  StatusBadge,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { getAuthorizedPatient } from "../services/patientService";
import { removeApplication, watchPatientRecords } from "../services/vaccinationService";
import { ageFromBirthDate, formatDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

export default function PacienteDetalhe() {
  const { isAdmin } = useAuth();
  const { personId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(location.state?.patient || null);
  const [records, setRecords] = useState([]);
  const [patientLoading, setPatientLoading] = useState(!patient);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    let active = true;
    if (!patient) {
      getAuthorizedPatient(personId, { isAdmin })
        .then((result) => {
          if (active) setPatient(result);
        })
        .catch((loadError) => {
          if (active) setError(friendlyFirebaseError(loadError, loadError.message));
        })
        .finally(() => {
          if (active) setPatientLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [personId, patient, isAdmin]);

  useEffect(() => {
    const unsubscribe = watchPatientRecords(
      personId,
      (data) => {
        setRecords(data);
        setRecordsLoading(false);
      },
      (watchError) => {
        setError(friendlyFirebaseError(watchError, watchError.message));
        setRecordsLoading(false);
      },
      { isAdmin },
    );
    return unsubscribe;
  }, [personId, isAdmin]);

  const lastRecord = records[0] || null;
  const activePatient = useMemo(
    () => patient || location.state?.patient || null,
    [patient, location.state],
  );

  if (patientLoading) {
    return <LoadingPanel label="Abrindo cadastro do paciente..." />;
  }

  if (!activePatient) {
    return (
      <StatePanel
        tone="error"
        title="Paciente indisponível"
        description={error || "Não foi possível localizar este cadastro."}
        action={
          <Link className="button button--primary" to="/pacientes">
            <ArrowLeft size={17} /> Voltar para pacientes
          </Link>
        }
      />
    );
  }

  async function handleDeleteApplication(record) {
    if (!window.confirm(`Anular a aplicação de ${record.vaccineName}? O histórico será preservado.`)) return;
    const reason = window.prompt("Informe o motivo da anulação:");
    if (reason === null) return;
    try {
      await removeApplication(record.id, reason);
      setSelectedRecord(null);
    } catch (deleteError) {
      setError(friendlyFirebaseError(deleteError, deleteError.message));
    }
  }

  return (
    <div className="page-stack">
      <Link className="back-link" to="/pacientes">
        <ArrowLeft size={17} /> Voltar para pacientes
      </Link>

      <PageHeader
        eyebrow="Cadastro do paciente"
        title={activePatient.name}
        description={`${activePatient.maskedCpf} • ${formatDate(activePatient.birthDate)}${ageFromBirthDate(activePatient.birthDate) !== null
            ? ` • ${ageFromBirthDate(activePatient.birthDate)} anos`
            : ""
          }`}
        actions={
          <button className="button button--primary" type="button" onClick={() => setFormOpen(true)}>
            <ClipboardPlus size={18} /> Registrar aplicação
          </button>
        }
      />

      {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

      <section className="stats-grid stats-grid--three">
        <StatCard icon={Syringe} label="Total de aplicações" value={recordsLoading ? "—" : records.length} helper="Histórico desta carteira" />
        <StatCard icon={History} label="Última aplicação" value={lastRecord ? formatDate(lastRecord.applicationDate) : "—"} helper={lastRecord?.vaccineName || "Sem registros"} tone="indigo" />
        <StatCard icon={ClipboardPlus} label="Tipo de paciente" value={activePatient.patientType === "CHILD" ? "Infantil" : "Adulto"} helper={activePatient.responsibleName || "Sem responsável informado"} tone="green" />
      </section>

      <section className="patient-layout">
        <article className="content-card patient-history">
          <header className="card-header">
            <div>
              <span className="eyebrow">Carteira</span>
              <h2>Histórico de aplicações</h2>
            </div>
            <span className="live-indicator"><i /> Tempo real</span>
          </header>

          {recordsLoading ? (
            <LoadingPanel label="Sincronizando histórico..." />
          ) : records.length === 0 ? (
            <StatePanel
              title="Carteira ainda sem aplicações"
              description="Registre a primeira vacina aplicada durante este atendimento."
              action={
                <button className="button button--primary" onClick={() => setFormOpen(true)} type="button">
                  <ClipboardPlus size={17} /> Registrar aplicação
                </button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Vacina</th><th>Dose</th><th>Aplicação</th><th>UBS</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td><strong>{record.vaccineName}</strong><small>{record.manufacturer || "Fabricante não informado"}</small></td>
                      <td>{record.doseLabel}</td>
                      <td>{formatDate(record.applicationDate)}</td>
                      <td>{record.ubsName || "Não informada"}</td>
                      <td><StatusBadge status={record.voidedAt ? "danger" : "active"}>{record.voidedAt ? "Anulada" : "Registrada"}</StatusBadge></td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-button" type="button" onClick={() => setSelectedRecord(record)} title="Detalhes">
                            <EyeIcon />
                          </button>
                          {isAdmin && !record.voidedAt ? <button className="icon-button" type="button" onClick={() => { setEditingRecord(record); setFormOpen(true); }} title="Editar campos permitidos">
                            <Pencil size={17} />
                          </button> : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="content-card patient-summary-panel">
          <div className="patient-summary-panel__avatar"><UserRound /></div>
          <h2>{activePatient.name}</h2>
          <span>{activePatient.maskedCpf}</span>
          <dl>
            <div><dt>Situação</dt><dd><StatusBadge status={activePatient.status === "ACTIVE" ? "active" : "warning"}>{activePatient.status === "ACTIVE" ? "Ativo" : "Cadastro não ativo"}</StatusBadge></dd></div>
            <div><dt>Nascimento</dt><dd>{formatDate(activePatient.birthDate)}</dd></div>
            <div><dt>E-mail</dt><dd>{activePatient.email || "Não informado"}</dd></div>
            <div><dt>Carteira</dt><dd>{records.length ? "Com registros" : "Sem registros"}</dd></div>
          </dl>
          <button className="button button--secondary" type="button" onClick={() => navigate("/pacientes")}>
            Voltar à lista
          </button>
        </aside>
      </section>

      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingRecord(null); }}
        title={editingRecord ? "Editar aplicação" : "Registrar aplicação"}
        description="A alteração será sincronizada automaticamente no histórico."
        wide
      >
        <VaccinationForm
          patient={activePatient}
          initialApplication={editingRecord}
          onCancel={() => { setFormOpen(false); setEditingRecord(null); }}
          onSaved={() => { setFormOpen(false); setEditingRecord(null); }}
        />
      </Modal>

      <Modal
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Detalhes da aplicação"
        description="Registro armazenado no SQL Connect."
      >
        <VaccinationDetail record={selectedRecord} />
        {isAdmin && selectedRecord && !selectedRecord.voidedAt ? (
          <div className="form-actions">
            <button className="button button--secondary" type="button" onClick={() => { setEditingRecord(selectedRecord); setSelectedRecord(null); setFormOpen(true); }}>
              <Pencil size={17} /> Editar
            </button>
            <button className="button button--danger" type="button" onClick={() => handleDeleteApplication(selectedRecord)}>
              Anular aplicação
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function EyeIcon() {
  return <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}
