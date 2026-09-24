import {
  ArrowRight,
  CalendarCheck2,
  ClipboardPlus,
  Search,
  Syringe,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, SkeletonRows, StatCard, StatePanel } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  isEffectiveApplication,
  watchApplications,
} from "../services/vaccinationService";
import { watchVaccines } from "../services/vaccineService";
import { asDate, formatDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Dashboard() {
  const { profile, isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [vaccinesLoading, setVaccinesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeRecords = watchApplications(
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
    const unsubscribeVaccines = watchVaccines(
      (data) => {
        setVaccines(data);
        setVaccinesLoading(false);
      },
      (watchError) => {
        setError(friendlyFirebaseError(watchError, watchError.message));
        setVaccinesLoading(false);
      },
    );
    return () => {
      unsubscribeRecords?.();
      unsubscribeVaccines?.();
    };
  }, [isAdmin]);

  const metrics = useMemo(() => {
    const today = new Date();
    const effectiveRecords = records.filter(isEffectiveApplication);
    const isToday = (value) => {
      const date = asDate(value);
      return date && date.toDateString() === today.toDateString();
    };
    return {
      patients: new Set(effectiveRecords.map((record) => record.patientId)).size,
      applications: effectiveRecords.length,
      today: effectiveRecords.filter((record) => isToday(record.applicationDate)).length,
      vaccines: vaccines.filter((vaccine) => vaccine.active).length,
    };
  }, [records, vaccines]);

  const firstName = (profile?.fullName || profile?.name || "Profissional").split(" ")[0];
  const loading = recordsLoading || vaccinesLoading;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Visão geral"
        title={`${greeting()}, ${firstName}`}
        description="Acompanhe os dados compartilhados do Vitta em tempo real."
        actions={
          <Link className="button button--primary" to="/pacientes">
            <Search size={18} /> Localizar paciente
          </Link>
        }
      />

      {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

      <section className="stats-grid" aria-label="Indicadores reais">
        <StatCard icon={UsersRound} label="Pacientes atendidos" value={loading ? "—" : metrics.patients} helper="Nos registros compartilhados" />
        <StatCard icon={ClipboardPlus} label="Aplicações registradas" value={loading ? "—" : metrics.applications} helper="Todos os profissionais" tone="indigo" />
        <StatCard icon={Syringe} label="Vacinas no catálogo" value={loading ? "—" : metrics.vaccines} helper="Itens ativos" tone="cyan" />
        <StatCard icon={CalendarCheck2} label="Registradas hoje" value={loading ? "—" : metrics.today} helper="Atualização em tempo real" tone="green" />
      </section>

      <section className="dashboard-grid">
        <article className="content-card content-card--span-2">
          <header className="card-header">
            <div>
              <span className="eyebrow">Atividade recente</span>
              <h2>Últimas aplicações</h2>
            </div>
            <Link className="text-link" to="/aplicacoes">
              Ver todas <ArrowRight size={16} />
            </Link>
          </header>
          {recordsLoading ? (
            <SkeletonRows rows={5} />
          ) : records.length === 0 ? (
            <StatePanel
              title="Nenhuma aplicação registrada"
              description="Registre uma aplicação para começar o histórico."
              action={<Link className="button button--secondary" to="/pacientes">Localizar paciente</Link>}
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Paciente</th><th>Vacina</th><th>Dose</th><th>Data</th></tr></thead>
                <tbody>
                  {records.filter(isEffectiveApplication).slice(0, 6).map((record) => (
                    <tr key={record.id}>
                      <td><strong>{record.patientName}</strong><small>{record.patientCpf || "CPF não informado"}</small></td>
                      <td>{record.vaccineName}</td>
                      <td>{record.doseLabel}</td>
                      <td>{formatDate(record.applicationDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <aside className="content-card quick-actions">
          <header className="card-header">
            <div>
              <span className="eyebrow">Próximas ações</span>
              <h2>Atalhos do atendimento</h2>
            </div>
          </header>
          <Link to="/pacientes" className="quick-action">
            <span><Search /></span>
            <div><strong>Buscar por CPF</strong><small>Localização exata</small></div>
            <ArrowRight />
          </Link>
          <Link to="/carteiras" className="quick-action">
            <span><UsersRound /></span>
            <div><strong>Abrir carteira</strong><small>Histórico do paciente</small></div>
            <ArrowRight />
          </Link>
          <Link to="/vacinas" className="quick-action">
            <span><Syringe /></span>
            <div><strong>Consultar catálogo</strong><small>Vacinas cadastradas</small></div>
            <ArrowRight />
          </Link>
        </aside>
      </section>
    </div>
  );
}
