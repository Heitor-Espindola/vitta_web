import { formatDate, formatDateTime } from "../utils/dates";
import {
  statusLabels,
  vaccinationRecordCapabilities,
  vaccinationStatus,
} from "../utils/vaccination";
import { StatusBadge } from "./ui";

export default function VaccinationDetail({ record }) {
  if (!record) return null;
  const status = vaccinationStatus(record);
  const fields = [
    ["Vacina", record.vaccineName],
    ["Dose", record.doseLabel],
    ["Data da aplicação", formatDate(record.appliedAt)],
    record.nextDoseAt
      ? ["Próxima dose", formatDate(record.nextDoseAt)]
      : null,
    record.lot ? ["Lote", record.lot] : null,
    record.manufacturer ? ["Fabricante", record.manufacturer] : null,
    record.facilityName ? ["Unidade", record.facilityName] : null,
    record.source === "professional_panel"
      ? ["Origem", "Registrado pelo Portal Vitta"]
      : null,
  ].filter(Boolean);
  const readOnly =
    !vaccinationRecordCapabilities.canUpdate &&
    !vaccinationRecordCapabilities.canDelete;
  return (
    <div className="record-detail">
      <div className="record-detail__status">
        <StatusBadge status={status}>{statusLabels[status]}</StatusBadge>
        {readOnly ? <span>Registro somente leitura</span> : null}
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
      {record.createdAt ? (
        <p className="record-detail__audit">
          Registrado em {formatDateTime(record.createdAt)} pelo profissional
          autenticado.
        </p>
      ) : null}
    </div>
  );
}
