import { BookOpen, Search, ShieldCheck, Syringe } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, SkeletonRows, StatePanel, StatusBadge } from "../components/ui";
import { watchVaccines } from "../services/vaccineService";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

export default function Vacinas() {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("active");

  useEffect(
    () =>
      watchVaccines(
        (data) => {
          setVaccines(data);
          setLoading(false);
        },
        (snapshotError) => {
          setError(friendlyFirebaseError(snapshotError));
          setLoading(false);
        },
      ),
    [],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return vaccines.filter((vaccine) => {
      const matchesFilter = filter === "all" || vaccine.active === (filter === "active");
      const matchesSearch = !term || [vaccine.name, vaccine.shortName, vaccine.description, vaccine.recommendedAge, ...vaccine.prevents]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [vaccines, search, filter]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Catálogo oficial"
        title="Vacinas"
        description="Consulte as vacinas e informações educativas usadas pelo aplicativo Vitta."
      />

      <section className="content-card">
        <div className="toolbar toolbar--wrap">
          <div className="input-with-icon toolbar__search">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar vacina ou doença prevenida" />
          </div>
          <div className="segmented-control" aria-label="Filtrar vacinas">
            <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")} type="button">Ativas</button>
            <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button">Todas</button>
            <button className={filter === "inactive" ? "active" : ""} onClick={() => setFilter("inactive")} type="button">Inativas</button>
          </div>
        </div>

        {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
        {loading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length === 0 ? (
          <StatePanel title="Nenhuma vacina encontrada" description="Ajuste a busca ou o filtro selecionado." />
        ) : (
          <div className="vaccine-grid">
            {filtered.map((vaccine) => (
              <article className="vaccine-card" key={vaccine.id}>
                <header>
                  <span className="vaccine-card__icon"><Syringe /></span>
                  <StatusBadge status={vaccine.active ? "active" : "inactive"}>{vaccine.active ? "Ativa" : "Inativa"}</StatusBadge>
                </header>
                <h2>{vaccine.name}</h2>
                <p>{vaccine.description || "Descrição educativa ainda não informada."}</p>
                <dl>
                  <div><dt>Público</dt><dd>{vaccine.recommendedAge || vaccine.targetGroups.join(", ") || "Conforme calendário"}</dd></div>
                  <div><dt>Doses</dt><dd>{vaccine.doseCount ?? "Conforme esquema"}</dd></div>
                  <div><dt>Previne</dt><dd>{vaccine.prevents.slice(0, 2).join(", ") || "Consulte a fonte oficial"}</dd></div>
                </dl>
                <footer>
                  <BookOpen size={15} /> {vaccine.sourceName || "Fonte oficial não informada"}
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="content-card info-banner">
        <ShieldCheck />
        <div><strong>Catálogo somente leitura</strong><p>A gestão administrativa de vacinas permanece bloqueada pelas Rules nesta etapa. O painel não exibe ações que falhariam.</p></div>
      </div>
    </div>
  );
}
