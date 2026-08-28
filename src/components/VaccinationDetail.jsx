import { formatDate, formatDateTime } from "../utils/dates";
import { statusLabels, vaccinationStatus } from "../utils/vaccination";
import { StatusBadge } from "./ui";

export default function VaccinationDetail({ record }) {
  if (!record) return null;
  const status = vaccinationStatus(record);
  const fields = [
    ["Vacina", record.vaccineName],
    ["Dose", record.doseLabel],
    ["Data da aplicação", formatDate(record.appliedAt)],
    ["Próxima dose", formatDate(record.nextDoseAt, "Não prevista")],
    ["Lote", record.lot || "Não informado"],
    ["Fabricante", record.manufacturer || "Não informado"],
    ["Unidade", record.facilityName || "Não informada"],
    ["Origem", record.source === "professional_panel" ? "Painel profissional" : "Registro legado"],
  ];
  return (
    <div className="record-detail">
      <div className="record-detail__status">
        <StatusBadge status={status}>{statusLabels[status]}</StatusBadge>
        <span>Registro somente leitura</span>
      </div>
      <dl>
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {record.notes ? (
        <div className="record-detail__notes">
          <strong>Observações</strong>
          <p>{record.notes}</p>
        </div>
      ) : null}
      <p className="record-detail__audit">
        Registrado em {formatDateTime(record.createdAt)} pelo profissional autenticado.
      </p>
    </div>
  );
}
