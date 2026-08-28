import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardPlus,
  History,
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
import { getAuthorizedPatient } from "../services/patientService";
import { watchPatientRecords } from "../services/vaccinationService";
import { ageFromBirthDate, formatDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";
import { statusLabels, vaccinationStatus } from "../utils/vaccination";

export default function PacienteDetalhe() {
  const { personId } = useParams();
  const location = useLocation();
  const [patient, setPatient] = useState(location.state?.patient || null);
  const [records, setRecords] = useState([]);
  const [patientLoading, setPatientLoading] = useState(!patient);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let active = true;
    if (!patient) {
      getAuthorizedPatient(personId)
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
  }, [personId, patient]);

  useEffect(() => {
    const unsubscribe = watchPatientRecords(
      personId,
      (data) => {
        setRecords(data);
        setRecordsLoading(false);
      },
      (snapshotError) => {
        setError(
          friendlyFirebaseError(
            snapshotError,
            "O acesso ao histórico expirou. Localize o paciente novamente.",
          ),
        );
        setRecordsLoading(false);
      },
    );
    return unsubscribe;
  }, [personId]);

  const nextRecords = useMemo(
    () =>
      records
        .filter((record) => vaccinationStatus(record) !== "applied")
        .sort((a, b) => a.nextDoseAt?.toMillis?.() - b.nextDoseAt?.toMillis?.()),
    [records],
  );
  const lastRecord = records[0] || null;

  if (patientLoading) return <LoadingPanel label="Abrindo carteira do paciente..." />;
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
        description={`${patient.maskedCpf} • ${formatDate(patient.birthDate)}${
          ageFromBirthDate(patient.birthDate) !== null
            ? ` • ${ageFromBirthDate(patient.birthDate)} anos`
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
        <StatCard icon={History} label="Última aplicação" value={lastRecord ? formatDate(lastRecord.appliedAt) : "—"} helper={lastRecord?.vaccineName || "Sem registros"} tone="indigo" />
        <StatCard icon={CalendarClock} label="Próximas ou atrasadas" value={recordsLoading ? "—" : nextRecords.length} helper="Status calculado, não gravado" tone="green" />
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
                <button className="button button--primary" onClick={() => setFormOpen(true)}>
                  <ClipboardPlus size={17} /> Registrar aplicação
                </button>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table data-table--clickable">
                <thead>
                  <tr><th>Vacina</th><th>Dose</th><th>Aplicação</th><th>Próxima dose</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const status = vaccinationStatus(record);
                    return (
                      <tr key={record.id} onClick={() => setSelectedRecord(record)} tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setSelectedRecord(record)}>
                        <td><strong>{record.vaccineName}</strong><small>{record.manufacturer || "Fabricante não informado"}</small></td>
                        <td>{record.doseLabel}</td>
                        <td>{formatDate(record.appliedAt)}</td>
                        <td>{formatDate(record.nextDoseAt, "Não prevista")}</td>
                        <td><StatusBadge status={status}>{statusLabels[status]}</StatusBadge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="content-card patient-summary-panel">
          <div className="patient-summary-panel__avatar"><UserRound /></div>
          <h2>{patient.name}</h2>
          <span>{patient.maskedCpf}</span>
          <dl>
            <div><dt>Situação</dt><dd><StatusBadge status="active">Cadastro ativo</StatusBadge></dd></div>
            <div><dt>Nascimento</dt><dd>{formatDate(patient.birthDate)}</dd></div>
            <div><dt>Carteira</dt><dd>{records.length ? "Com registros" : "Sem registros"}</dd></div>
          </dl>
          <div className="privacy-note">Dados técnicos de identidade não são exibidos ao profissional.</div>
        </aside>
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Registrar aplicação" description="Os dados serão enviados ao histórico oficial do paciente." wide>
        <VaccinationForm
          patient={patient}
          onCancel={() => setFormOpen(false)}
          onSaved={(result) => {
            setFormOpen(false);
            setSuccess(result);
          }}
        />
      </Modal>

      <Modal open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)} title="Detalhes da aplicação" description="Registro oficial e somente leitura.">
        <VaccinationDetail record={selectedRecord} />
      </Modal>

      <Modal open={Boolean(success)} onClose={() => setSuccess(null)} title="Aplicação registrada com sucesso" description="A carteira foi atualizada em tempo real.">
        {success ? (
          <div className="success-summary">
            <div className="state-icon state-icon--success"><CheckCircle2 /></div>
            <dl>
              <div><dt>Paciente</dt><dd>{patient.name}</dd></div>
              <div><dt>Vacina</dt><dd>{success.vaccineName}</dd></div>
              <div><dt>Dose</dt><dd>{success.doseLabel}</dd></div>
              <div><dt>Data</dt><dd>{formatDate(`${success.appliedDate}T12:00:00`)}</dd></div>
            </dl>
            <button className="button button--primary" onClick={() => setSuccess(null)}>Voltar à carteira</button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
