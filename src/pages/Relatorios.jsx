import {
  BarChart3,
  Building2,
  CalendarCheck2,
  RotateCcw,
  Syringe,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PageHeader,
  SkeletonRows,
  StatCard,
  StatePanel,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { watchProfessionalReportRecords } from "../services/vaccinationService";
import { formatDate, toLocalDateInput } from "../utils/dates";
import {
  ReportPeriod,
  buildProfessionalReport,
} from "../utils/reports";

const periodOptions = [
  [ReportPeriod.today, "Hoje"],
  [ReportPeriod.last7Days, "Últimos 7 dias"],
  [ReportPeriod.last30Days, "Últimos 30 dias"],
  [ReportPeriod.custom, "Período personalizado"],
];

function CountBars({ rows }) {
  const maximum = rows[0]?.count || 1;
  return (
    <div className="bar-chart">
      {rows.map(({ label, count }) => (
        <div className="bar-chart__row" key={label}>
          <span title={label}>{label}</span>
          <div aria-hidden="true">
            <i style={{ width: `${(count / maximum) * 100}%` }} />
          </div>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Relatorios() {
  const { firebaseUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryVersion, setRetryVersion] = useState(0);
  const [period, setPeriod] = useState(ReportPeriod.last30Days);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    return watchProfessionalReportRecords(
      firebaseUser.uid,
      (data) => {
        setRecords(data);
        setLoading(false);
      },
      () => {
        setError("Não foi possível carregar suas aplicações.");
        setLoading(false);
      },
    );
  }, [firebaseUser.uid, retryVersion]);

  const report = useMemo(
    () =>
      buildProfessionalReport(records, {
        period,
        customStart,
        customEnd,
      }),
    [records, period, customStart, customEnd],
  );
  const periodLabel =
    periodOptions.find(([value]) => value === period)?.[1] || "Período";

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Atividade profissional"
        title="Relatórios"
        description="Acompanhe suas aplicações registradas."
      />

      <section className="content-card report-filters">
        <div className="segmented-control report-periods" aria-label="Período">
          {periodOptions.map(([value, label]) => (
            <button
              className={period === value ? "active" : ""}
              type="button"
              onClick={() => setPeriod(value)}
              key={value}
            >
              {label}
            </button>
          ))}
        </div>
        {period === ReportPeriod.custom ? (
          <div className="custom-period-fields">
            <label className="field">
              <span>Data inicial</span>
              <input
                type="date"
                value={customStart}
                max={toLocalDateInput()}
                onChange={(event) => setCustomStart(event.target.value)}
                aria-invalid={Boolean(report.error)}
              />
            </label>
            <label className="field">
              <span>Data final</span>
              <input
                type="date"
                value={customEnd}
                min={customStart || undefined}
                max={toLocalDateInput()}
                onChange={(event) => setCustomEnd(event.target.value)}
                aria-invalid={Boolean(report.error)}
              />
            </label>
          </div>
        ) : null}
        {report.error ? (
          <div className="inline-alert inline-alert--error" role="alert">
            {report.error}
          </div>
        ) : null}
      </section>

      {error ? (
        <StatePanel
          tone="error"
          title="Não foi possível carregar suas aplicações."
          description="Verifique sua conexão e tente novamente."
          action={
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                setRetryVersion((current) => current + 1);
              }}
            >
              <RotateCcw size={17} /> Tentar novamente
            </button>
          }
        />
      ) : loading ? (
        <section className="content-card">
          <SkeletonRows rows={6} />
        </section>
      ) : !report.error && report.total === 0 ? (
        <StatePanel
          title="Nenhuma aplicação neste período."
          description="Selecione outro período para consultar sua atividade."
        />
      ) : !report.error ? (
        <>
          <section className="stats-grid stats-grid--three">
            <StatCard
              icon={Syringe}
              label="Aplicações"
              value={report.total}
              helper={periodLabel}
            />
            <StatCard
              icon={CalendarCheck2}
              label="Aplicações hoje"
              value={report.today}
              helper="Dentro do período selecionado"
            />
            <StatCard
              icon={BarChart3}
              label="Vacinas diferentes"
              value={report.differentVaccines}
              helper="Com aplicações no período"
            />
          </section>

          <section className="report-grid">
            <article className="content-card report-card">
              <header className="card-header">
                <div>
                  <span className="eyebrow">Distribuição</span>
                  <h2>Aplicações por vacina</h2>
                </div>
                <BarChart3 />
              </header>
              <CountBars rows={report.byVaccine} />
            </article>

            {report.byFacility.length ? (
              <article className="content-card report-card">
                <header className="card-header">
                  <div>
                    <span className="eyebrow">Atendimento</span>
                    <h2>Aplicações por unidade</h2>
                  </div>
                  <Building2 />
                </header>
                <CountBars rows={report.byFacility} />
              </article>
            ) : null}
          </section>

          <section className="content-card report-activity">
            <header className="card-header">
              <div>
                <span className="eyebrow">Período selecionado</span>
                <h2>Atividade recente</h2>
              </div>
            </header>
            <div className="report-activity__list">
              {report.recentActivity.map((activity, index) => (
                <article
                  key={`${activity.vaccineName}-${String(activity.appliedAt)}-${index}`}
                >
                  <span className="vaccine-card__icon">
                    <Syringe />
                  </span>
                  <div>
                    <strong>{activity.vaccineName}</strong>
                    {activity.doseLabel ? <small>{activity.doseLabel}</small> : null}
                  </div>
                  <div>
                    <strong>{formatDate(activity.appliedAt)}</strong>
                    {activity.facilityName ? (
                      <small>{activity.facilityName}</small>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <p className="report-disclaimer">
        Os dados incluem somente aplicações registradas pela sua conta
        profissional. Nenhum paciente ou identificador técnico é exibido.
      </p>
    </div>
  );
}
