import { formatDate, formatDateTime } from "../utils/dates";
import { StatusBadge } from "./ui";

export default function VaccinationDetail({ record }) {
  if (!record) return null;

  const fields = [
    ["Paciente", record.patientName],
    ["CPF", record.patientCpf || "Não informado"],
    ["Vacina", record.vaccineName],
    ["Dose", record.doseLabel],
    ["Data da aplicação", formatDate(record.applicationDate)],
    ["Lote", record.batchCode || "Não informado"],
    ["Fabricante", record.manufacturer || "Não informado"],
    ["Unidade", record.ubsName || "Não informada"],
    ["Profissional", record.professionalName || "Não informado"],
    ["Registro profissional", record.professionalRegistration || "Não informado"],
  ];

  return (
    <div className="record-detail">
      <div className="record-detail__status">
        <StatusBadge status="active">Registrada</StatusBadge>
        <span>Registro do SQL Connect</span>
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
        Data registrada: {formatDateTime(record.applicationDate)}.
      </p>
    </div>
  );
}
