import { ClipboardPlus, Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import VaccinationDetail from "../components/VaccinationDetail";
import { Modal, PageHeader, SkeletonRows, StatePanel, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { watchProfessionalRecords } from "../services/vaccinationService";
import { formatDate } from "../utils/dates";
import { friendlyFirebaseError } from "../utils/firebaseErrors";
import { statusLabels, vaccinationStatus } from "../utils/vaccination";

export default function Aplicacoes() {
  const { firebaseUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(
    () =>
      watchProfessionalRecords(
        firebaseUser.uid,
        (data) => {
          setRecords(data);
          setLoading(false);
        },
        (snapshotError) => {
          setError(friendlyFirebaseError(snapshotError));
          setLoading(false);
        },
      ),
    [firebaseUser.uid],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return records;
    return records.filter((record) =>
      [record.vaccineName, record.doseLabel, record.facilityName, record.lot]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase("pt-BR").includes(term)),
    );
  }, [records, search]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Registros oficiais"
        title="Aplicações"
        description="Acompanhe as aplicações registradas pela sua conta profissional."
        actions={
          <Link className="button button--primary" to="/pacientes">
            <ClipboardPlus size={18} /> Nova aplicação
          </Link>
        }
      />

      <section className="content-card">
        <div className="toolbar">
          <div className="input-with-icon toolbar__search">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por vacina, dose, lote ou unidade" />
          </div>
          <span className="toolbar__count">{filtered.length} registro(s)</span>
        </div>

        {error ? <div className="inline-alert inline-alert--error">{error}</div> : null}
        {loading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length === 0 ? (
          <StatePanel
            title={records.length ? "Nenhum resultado encontrado" : "Nenhuma aplicação registrada"}
            description={records.length ? "Tente ajustar o termo de busca." : "Localize um paciente para registrar uma aplicação."}
            action={!records.length ? <Link className="button button--secondary" to="/pacientes">Localizar paciente</Link> : null}
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Vacina</th><th>Dose</th><th>Data</th><th>Unidade</th><th>Lote</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>
                {filtered.map((record) => {
                  const status = vaccinationStatus(record);
                  return (
                    <tr key={record.id}>
                      <td><strong>{record.vaccineName}</strong><small>{record.manufacturer || "Fabricante não informado"}</small></td>
                      <td>{record.doseLabel}</td>
                      <td>{formatDate(record.appliedAt)}</td>
                      <td>{record.facilityName || "Não informada"}</td>
                      <td>{record.lot || "—"}</td>
                      <td><StatusBadge status={status}>{statusLabels[status]}</StatusBadge></td>
                      <td><button className="icon-button" type="button" onClick={() => setSelectedRecord(record)} aria-label={`Ver ${record.vaccineName}`}><Eye size={18} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)} title="Detalhes da aplicação" description="Edição e exclusão não são permitidas para registros oficiais.">
        <VaccinationDetail record={selectedRecord} />
      </Modal>
    </div>
  );
}
