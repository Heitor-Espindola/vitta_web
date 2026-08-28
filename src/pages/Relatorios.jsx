import { BarChart3, CalendarDays, Syringe, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, SkeletonRows, StatCard, StatePanel } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { watchProfessionalRecords } from "../services/vaccinationService";
import { asDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

export default function Relatorios() {
  const { firebaseUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    () =>
      watchProfessionalRecords(
        firebaseUser.uid,
        (data) => { setRecords(data); setLoading(false); },
        (snapshotError) => { setError(friendlyFirebaseError(snapshotError)); setLoading(false); },
      ),
    [firebaseUser.uid],
  );

  const report = useMemo(() => {
    const now = new Date();
    const last30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const recent = records.filter((record) => (asDate(record.appliedAt) || new Date(0)) >= last30);
    const counts = new Map();
    recent.forEach((record) => counts.set(record.vaccineName, (counts.get(record.vaccineName) || 0) + 1));
    const topVaccines = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      recent,
      patients: new Set(recent.map((record) => record.patientId)).size,
      topVaccines,
      max: topVaccines[0]?.[1] || 1,
    };
  }, [records]);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Dados reais" title="Relatórios" description="Resumo dos registros realizados pela sua conta nos últimos 30 dias." />
      {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
      <section className="stats-grid stats-grid--three">
        <StatCard icon={Syringe} label="Aplicações no período" value={loading ? "—" : report.recent.length} helper="Últimos 30 dias" />
        <StatCard icon={UsersRound} label="Pacientes atendidos" value={loading ? "—" : report.patients} helper="Contagem única no período" tone="indigo" />
        <StatCard icon={CalendarDays} label="Média por dia" value={loading ? "—" : (report.recent.length / 30).toFixed(1)} helper="Somente seus registros" tone="green" />
      </section>
      <section className="content-card report-card">
        <header className="card-header"><div><span className="eyebrow">Distribuição</span><h2>Vacinas mais aplicadas</h2></div><BarChart3 /></header>
        {loading ? <SkeletonRows rows={5} /> : report.topVaccines.length === 0 ? (
          <StatePanel title="Sem dados no período" description="As métricas aparecerão após o registro de aplicações." />
        ) : (
          <div className="bar-chart">
            {report.topVaccines.map(([name, count]) => (
              <div className="bar-chart__row" key={name}>
                <span>{name}</span><div><i style={{ width: `${(count / report.max) * 100}%` }} /></div><strong>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </section>
      <p className="report-disclaimer">Este relatório não representa a produção global da unidade; ele inclui apenas aplicações auditadas pelo seu UID profissional.</p>
    </div>
  );
}
