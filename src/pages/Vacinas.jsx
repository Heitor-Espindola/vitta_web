import {
  BookOpen,
  Eye,
  RotateCcw,
  Search,
  ShieldCheck,
  Syringe,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  PageHeader,
  SkeletonRows,
  StatePanel,
  StatusBadge,
} from "../components/ui";
import { watchVaccines } from "../services/vaccineService";
import {
  nextCatalogRetryVersion,
  searchVaccines,
  vaccineCatalogCapabilities,
  vaccineCatalogViewState,
} from "../utils/vaccineCatalog";

function VaccineDetail({ vaccine }) {
  if (!vaccine) return null;
  const audience =
    vaccine.recommendedAge || vaccine.targetGroups.join(", ");
  const fields = [
    vaccine.shortName ? ["Sigla", vaccine.shortName] : null,
    vaccine.description ? ["Descrição", vaccine.description] : null,
    audience ? ["Público/faixa", audience] : null,
    vaccine.doseCount !== null
      ? ["Número de doses", vaccine.doseCount]
      : null,
    vaccine.intervalDays !== null
      ? ["Intervalo", `${vaccine.intervalDays} dias`]
      : null,
    vaccine.prevents.length
      ? ["Previne", vaccine.prevents.join(", ")]
      : null,
    vaccine.hasActiveStatus
      ? ["Situação", vaccine.active ? "Ativa" : "Inativa"]
      : null,
    vaccine.sourceName ? ["Fonte", vaccine.sourceName] : null,
  ].filter(Boolean);

  return (
    <div className="catalog-detail">
      <div className="catalog-detail__heading">
        <span className="vaccine-card__icon">
          <Syringe />
        </span>
        <div>
          <h3>{vaccine.name}</h3>
          <span>Informações disponíveis no catálogo Vitta</span>
        </div>
      </div>
      <dl>
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {vaccine.sourceUrl ? (
        <a
          className="text-link"
          href={vaccine.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen size={16} /> Consultar fonte
        </a>
      ) : null}
    </div>
  );
}

export default function Vacinas() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [retryVersion, setRetryVersion] = useState(0);
  const [selectedVaccine, setSelectedVaccine] = useState(null);

  useEffect(() => {
    return watchVaccines(
      (data) => {
        setVaccines(data);
        setLoading(false);
      },
      () => {
        setError("Não foi possível carregar o catálogo.");
        setLoading(false);
      },
    );
  }, [retryVersion]);

  const hasStatusField = vaccines.some((vaccine) => vaccine.hasActiveStatus);
  const filtered = useMemo(
    () => searchVaccines(vaccines, search, hasStatusField ? filter : "all"),
    [vaccines, search, filter, hasStatusField],
  );
  const viewState = vaccineCatalogViewState({
    loading,
    error,
    vaccines,
    filtered,
  });

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Catálogo"
        title="Vacinas"
        description="Consulte o catálogo utilizado pelo Vitta."
      />

      <section className="content-card">
        <div className="toolbar toolbar--wrap">
          <div className="input-with-icon toolbar__search">
            <Search size={18} aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, sigla ou descrição"
              aria-label="Pesquisar no catálogo de vacinas"
            />
          </div>
          {hasStatusField ? (
            <div className="segmented-control" aria-label="Filtrar vacinas">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
                type="button"
              >
                Todas
              </button>
              <button
                className={filter === "active" ? "active" : ""}
                onClick={() => setFilter("active")}
                type="button"
              >
                Ativas
              </button>
              <button
                className={filter === "inactive" ? "active" : ""}
                onClick={() => setFilter("inactive")}
                type="button"
              >
                Inativas
              </button>
            </div>
          ) : null}
          {!loading && !error ? (
            <span className="toolbar__count">{filtered.length} vacina(s)</span>
          ) : null}
        </div>

        {viewState === "loading" ? <SkeletonRows rows={6} /> : null}
        {viewState === "error" ? (
          <StatePanel
            tone="error"
            title="Não foi possível carregar o catálogo."
            description="Verifique sua conexão e tente novamente."
            action={
              <button
                className="button button--secondary"
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError("");
                  setRetryVersion((current) =>
                    nextCatalogRetryVersion(current),
                  );
                }}
              >
                <RotateCcw size={17} /> Tentar novamente
              </button>
            }
          />
        ) : null}
        {viewState === "empty" ? (
          <StatePanel
            title="Catálogo de vacinas indisponível"
            description="Nenhuma vacina foi cadastrada no catálogo."
          />
        ) : null}
        {viewState === "no-results" ? (
          <StatePanel
            title="Nenhuma vacina encontrada"
            description="Ajuste a pesquisa ou o filtro selecionado."
          />
        ) : null}
        {viewState === "ready" ? (
          <div className="vaccine-grid">
            {filtered.map((vaccine) => {
              const audience =
                vaccine.recommendedAge || vaccine.targetGroups.join(", ");
              return (
                <article className="vaccine-card" key={vaccine.id}>
                  <header>
                    <span className="vaccine-card__icon">
                      <Syringe />
                    </span>
                    {vaccine.hasActiveStatus ? (
                      <StatusBadge
                        status={vaccine.active ? "active" : "inactive"}
                      >
                        {vaccine.active ? "Ativa" : "Inativa"}
                      </StatusBadge>
                    ) : null}
                  </header>
                  <h2>{vaccine.name}</h2>
                  {vaccine.shortName ? (
                    <span className="vaccine-card__short-name">
                      {vaccine.shortName}
                    </span>
                  ) : null}
                  {vaccine.description ? <p>{vaccine.description}</p> : null}
                  <dl>
                    {audience ? (
                      <div>
                        <dt>Público</dt>
                        <dd>{audience}</dd>
                      </div>
                    ) : null}
                    {vaccine.doseCount !== null ? (
                      <div>
                        <dt>Doses</dt>
                        <dd>{vaccine.doseCount}</dd>
                      </div>
                    ) : null}
                    {vaccine.prevents.length ? (
                      <div>
                        <dt>Previne</dt>
                        <dd>{vaccine.prevents.slice(0, 2).join(", ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <footer>
                    <button
                      className="button button--secondary button--small"
                      type="button"
                      onClick={() => setSelectedVaccine(vaccine)}
                    >
                      <Eye size={16} /> Ver detalhes
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      {!vaccineCatalogCapabilities.canCreate ? (
        <div className="content-card info-banner">
          <ShieldCheck />
          <div>
            <strong>Catálogo somente leitura</strong>
            <p>
              As informações estão disponíveis para consulta durante o
              atendimento profissional.
            </p>
          </div>
        </div>
      ) : null}

      <Modal
        open={Boolean(selectedVaccine)}
        onClose={() => setSelectedVaccine(null)}
        title="Detalhes da vacina"
        description="Dados disponíveis no catálogo."
      >
        <VaccineDetail vaccine={selectedVaccine} />
      </Modal>
    </div>
  );
}
