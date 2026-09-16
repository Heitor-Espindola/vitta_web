import { subscribe } from "firebase/data-connect";
import {
  createAppointment,
  deleteAppointment,
  listAppointmentsRef,
  updateAppointment,
} from "@dataconnect/generated";
import { asDate } from "../utils/dates";

function timestampFromInput(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Informe uma data e hora válidas.");
  }
  return date.toISOString();
}

export function mapAppointment(item) {
  return {
    id: item?.id || "",
    patientId: item?.patient?.id || "",
    patientName: item?.patient?.user?.name || "Paciente não informado",
    patientCpf: item?.patient?.user?.cpf || "",
    vaccineId: item?.vaccine?.id || "",
    vaccineName: item?.vaccine?.name || "Vacina não informada",
    ubsId: item?.ubs?.id || "",
    ubsName: item?.ubs?.name || "UBS não informada",
    createdAt: item?.createdAt || null,
    scheduledAt: item?.scheduledAt || null,
    status: item?.status || "SCHEDULED",
    notes: item?.notes || "",
  };
}

export function watchAppointments(onData, onError) {
  return subscribe(
    listAppointmentsRef(),
    (result) => {
      const items = (result?.data?.appointments || [])
        .map(mapAppointment)
        .sort(
          (a, b) =>
            (asDate(a.scheduledAt)?.getTime() || 0) -
            (asDate(b.scheduledAt)?.getTime() || 0),
        );
      onData(items);
    },
    onError,
  );
}

export function addAppointment({
  patientId,
  vaccineId,
  ubsId,
  scheduledAt,
  status,
  notes,
}) {
  return createAppointment({
    patientId,
    vaccineId,
    ubsId: ubsId || null,
    createdAt: new Date().toISOString(),
    scheduledAt: timestampFromInput(scheduledAt),
    status,
    notes: String(notes || "").trim() || null,
  });
}

export function editAppointment(
  id,
  { patientId, vaccineId, ubsId, createdAt, scheduledAt, status, notes },
) {
  return updateAppointment({
    id,
    patientId,
    vaccineId,
    ubsId: ubsId || null,
    createdAt: createdAt || new Date().toISOString(),
    scheduledAt: timestampFromInput(scheduledAt),
    status,
    notes: String(notes || "").trim() || null,
  });
}

export function removeAppointment(id) {
  return deleteAppointment({ id });
}
