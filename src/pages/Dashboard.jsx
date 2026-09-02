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
import { watchProfessionalRecords } from "../services/vaccinationService";
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
  const { profile, firebaseUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [vaccinesLoading, setVaccinesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribeRecords = watchProfessionalRecords(
      firebaseUser.uid,
      (data) => {
        setRecords(data);
        setRecordsLoading(false);
      },
      (snapshotError) => {
        setError(friendlyFirebaseError(snapshotError));
        setRecordsLoading(false);
      },
    );
    const unsubscribeVaccines = watchVaccines(
      (data) => {
        setVaccines(data);
        setVaccinesLoading(false);
      },
      (snapshotError) => {
        setError(friendlyFirebaseError(snapshotError));
        setVaccinesLoading(false);
      },
    );
    return () => {
      unsubscribeRecords();
      unsubscribeVaccines();
    };
  }, [firebaseUser.uid]);

  const metrics = useMemo(() => {
    const today = new Date();
    const isToday = (value) => {
      const date = asDate(value);
      return (
        date &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    };
    return {
      patients: new Set(records.map((record) => record.patientId)).size,
      applications: records.length,
      today: records.filter((record) => isToday(record.appliedAt)).length,
      vaccines: vaccines.filter((vaccine) => vaccine.active).length,
    };
  }, [records, vaccines]);

  const firstName = (profile?.fullName || profile?.name || "Profissional").split(" ")[0];
  const loading = recordsLoading || vaccinesLoading;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={`${greeting()}, ${firstName}`}
        title="Dashboard"
        description="Acompanhe os atendimentos e registros realizados pela sua conta."
        actions={
          <Link className="button button--primary" to="/pacientes">
            <Search size={18} /> Localizar paciente
          </Link>
        }
      />

      {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}

      <section className="stats-grid" aria-label="Indicadores reais">
        <StatCard icon={UsersRound} label="Pacientes atendidos" value={loading ? "—" : metrics.patients} helper="Nos seus registros" />
        <StatCard icon={ClipboardPlus} label="Aplicações registradas" value={loading ? "—" : metrics.applications} helper="Pela sua conta" />
        <StatCard icon={CalendarCheck2} label="Aplicações hoje" value={loading ? "—" : metrics.today} helper="No dia atual" />
        <StatCard icon={Syringe} label="Vacinas ativas" value={loading ? "—" : metrics.vaccines} helper="No catálogo Vitta" />
      </section>

      <section className="dashboard-grid">
        <article className="content-card content-card--span-2">
          <header className="card-header">
            <div>
              <h2>Atividade recente</h2>
              <p>Últimas aplicações registradas pela sua conta.</p>
            </div>
            <Link className="text-link" to="/aplicacoes">
              Ver todas <ArrowRight size={16} />
            </Link>
          </header>
          {recordsLoading ? (
            <SkeletonRows rows={5} />
          ) : records.length === 0 ? (
            <StatePanel
              title="Nenhuma atividade recente"
              description="As aplicações registradas por você aparecerão aqui."
              action={
                <Link className="button button--secondary" to="/pacientes">
                  Localizar paciente
                </Link>
              }
            />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vacina</th>
                    <th>Dose</th>
                    <th>Data</th>
                    <th>Unidade</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 6).map((record) => (
                    <tr key={record.id}>
                      <td><strong>{record.vaccineName}</strong></td>
                      <td>{record.doseLabel}</td>
                      <td>{formatDate(record.appliedAt)}</td>
                      <td>{record.facilityName || "Não informada"}</td>
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
              <h2>Ações rápidas</h2>
              <p>Continue um atendimento com segurança.</p>
            </div>
          </header>
          <Link to="/pacientes" className="quick-action">
            <span><Search /></span>
            <div><strong>Buscar paciente</strong><small>Localize uma carteira pelo CPF</small></div>
            <ArrowRight />
          </Link>
          <Link to="/pacientes" className="quick-action">
            <span><ClipboardPlus /></span>
            <div><strong>Registrar aplicação</strong><small>Primeiro localize o paciente</small></div>
            <ArrowRight />
          </Link>
          <Link to="/vacinas" className="quick-action">
            <span><Syringe /></span>
            <div><strong>Consultar catálogo</strong><small>Vacinas oficiais disponíveis</small></div>
            <ArrowRight />
          </Link>
        </aside>
      </section>
    </div>
  );
}
