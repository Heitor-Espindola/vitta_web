import {
  ArrowLeft,
  CalendarClock,
  ClipboardPlus,
  History,
  Search,
  Syringe,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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
import {
  getAuthorizedPatient,
  isPatientAccessExpired,
  patientAccessErrorMessage,
} from "../services/patientService";
import { watchPatientRecords } from "../services/vaccinationService";
import { ageFromBirthDate, formatDate } from "../utils/dates";
import {
  derivePatientRecordSummary,
  statusLabels,
  vaccinationStatus,
} from "../utils/vaccination";

export default function PacienteDetalhe() {
  const { personId } = useParams();
  const location = useLocation();
  const [patient, setPatient] = useState(location.state?.patient || null);
  const [records, setRecords] = useState([]);
  const [patientLoading, setPatientLoading] = useState(!patient);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessExpired, setAccessExpired] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    let active = true;
    if (!patient) {
      getAuthorizedPatient(personId)
        .then((result) => {
          if (active) {
            setPatient(result);
            setError("");
          }
        })
        .catch((loadError) => {
          if (active) {
            setAccessExpired(isPatientAccessExpired(loadError));
            setError(patientAccessErrorMessage(loadError));
          }
        })
        .finally(() => {
          if (active) setPatientLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [personId, patient]);

  useEffect(() => {
    const unsubscribe = watchPatientRecords(
      personId,
      (data) => {
        setRecords(data);
        setError("");
        setAccessExpired(false);
        setRecordsLoading(false);
      },
      (snapshotError) => {
        setAccessExpired(isPatientAccessExpired(snapshotError));
        setError(patientAccessErrorMessage(snapshotError));
        setFormOpen(false);
        setRecordsLoading(false);
      },
    );
    return unsubscribe;
  }, [personId]);

  const summary = useMemo(
    () => derivePatientRecordSummary(records),
    [records],
  );
  const patientDescription = useMemo(() => {
    const details = [patient?.maskedCpf].filter(Boolean);
    if (patient?.birthDate) {
      details.push(formatDate(patient.birthDate));
      const age = ageFromBirthDate(patient.birthDate);
      if (age !== null) details.push(`${age} anos`);
    }
    return details.join(" • ");
  }, [patient]);

  if (patientLoading) {
    return <LoadingPanel label="Abrindo carteira do paciente..." />;
  }
  if (!patient) {
    return (
      <StatePanel
        tone="error"
        title="Carteira indisponível"
        description={error || "Localize novamente o paciente pelo CPF."}
        action={
          <Link className="button button--primary" to="/pacientes">
            <ArrowLeft size={17} /> Voltar à busca
          </Link>
        }
      />
    );
  }

  return (
    <div className="page-stack">
      <Link className="back-link" to="/pacientes">
        <ArrowLeft size={17} /> Voltar para busca
      </Link>
      <PageHeader
        eyebrow="Carteira do paciente"
        title={patient.name}
        description={patientDescription}
        actions={
          accessExpired ? (
            <Link className="button button--primary" to="/pacientes">
              <Search size={18} /> Localizar novamente
            </Link>
          ) : (
            <button
              className="button button--primary"
              type="button"
              onClick={() => setFormOpen(true)}
            >
              <ClipboardPlus size={18} /> Registrar aplicação
            </button>
          )
        }
      />

      {error ? (
        <div
          className="inline-alert inline-alert--error operational-alert"
          role="alert"
        >
          <span>{error}</span>
          {accessExpired ? (
            <Link
              className="button button--secondary button--small"
              to="/pacientes"
            >
              Localizar paciente
            </Link>
          ) : null}
        </div>
      ) : null}

      <section className="stats-grid stats-grid--three">
        <StatCard
          icon={Syringe}
          label="Aplicações"
          value={recordsLoading ? "—" : summary.total}
          helper="Registros desta carteira"
        />
        <StatCard
          icon={History}
          label="Última aplicação"
          value={summary.lastRecord ? formatDate(summary.lastRecord.appliedAt) : "—"}
          helper={summary.lastRecord?.vaccineName || "Sem registros"}
          tone="indigo"
        />
        <StatCard
          icon={CalendarClock}
          label="Próxima dose"
          value={summary.nextRecord ? formatDate(summary.nextRecord.nextDoseAt) : "—"}
          helper={summary.nextRecord?.vaccineName || "Nenhuma dose prevista"}
          tone="green"
        />
      </section>

      <section className="patient-layout">
        <article className="content-card patient-history">
          <header className="card-header">
            <div>
              <span className="eyebrow">Carteira</span>
              <h2>Histórico de aplicações</h2>
            </div>
            <span className="live-indicator">
              <i /> Tempo real
            </span>
          </header>
          {recordsLoading ? (
            <LoadingPanel label="Sincronizando histórico..." />
          ) : summary.total === 0 ? (
            <StatePanel
              title="Nenhuma aplicação registrada"
              description="Quando uma vacina for registrada, ela aparecerá no histórico desta carteira."
              action={
                !accessExpired ? (
                  <button
                    className="button button--primary"
                    type="button"
                    onClick={() => setFormOpen(true)}
                  >
                    <ClipboardPlus size={17} /> Registrar primeira aplicação
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table data-table--clickable">
                <thead>
                  <tr>
                    <th>Vacina</th>
                    <th>Dose</th>
                    <th>Aplicação</th>
                    <th>Próxima dose</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.orderedRecords.map((record) => {
                    const status = vaccinationStatus(record);
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        tabIndex={0}
                        aria-label={`Ver detalhes de ${record.vaccineName}`}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedRecord(record);
                          }
                        }}
                      >
                        <td>
                          <strong>{record.vaccineName}</strong>
                          {record.manufacturer ? (
                            <small>{record.manufacturer}</small>
                          ) : null}
                          {record.lot ? <small>Lote: {record.lot}</small> : null}
                          {record.facilityName ? (
                            <small>Unidade: {record.facilityName}</small>
                          ) : null}
                        </td>
                        <td>{record.doseLabel}</td>
                        <td>{formatDate(record.appliedAt)}</td>
                        <td>
                          {record.nextDoseAt ? formatDate(record.nextDoseAt) : null}
                        </td>
                        <td>
                          <StatusBadge status={status}>
                            {statusLabels[status]}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="content-card patient-summary-panel">
          <div className="patient-summary-panel__avatar">
            <UserRound />
          </div>
          <h2>{patient.name}</h2>
          <span>{patient.maskedCpf}</span>
          <dl>
            {patient.accountStatus === "active" ? (
              <div>
                <dt>Situação</dt>
                <dd>
                  <StatusBadge status="active">Cadastro ativo</StatusBadge>
                </dd>
              </div>
            ) : null}
            {patient.birthDate ? (
              <div>
                <dt>Nascimento</dt>
                <dd>{formatDate(patient.birthDate)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Aplicações</dt>
              <dd>{recordsLoading ? "—" : summary.total}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <Modal
        open={formOpen && !accessExpired}
        onClose={() => setFormOpen(false)}
        title="Registrar aplicação"
        description="Preencha os dados da vacina aplicada ao paciente."
        wide
      >
        <VaccinationForm
          patient={patient}
          onCancel={() => setFormOpen(false)}
          onSaved={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title="Detalhes da aplicação"
        description="Registro oficial e somente leitura."
      >
        <VaccinationDetail record={selectedRecord} />
      </Modal>
    </div>
  );
}
