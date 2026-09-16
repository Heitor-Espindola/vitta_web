import { subscribe } from "firebase/data-connect";
import {
  createBatch,
  createVaccine,
  deleteBatch,
  deleteVaccine,
  listBatchesRef,
  listVaccinesRef,
  updateBatch,
  updateVaccine,
} from "@dataconnect/generated";

function mapVaccine(vaccine) {
  return {
    id: vaccine.id,
    name: vaccine.name || "Vacina sem nome",
    shortName: "",
    description: vaccine.description || "",
    recommendedAge: "",
    doseCount:
      typeof vaccine.requiredDoses === "number"
        ? vaccine.requiredDoses
        : null,
    intervalDays: null,
    targetGroups: [],
    prevents: [],
    doseSchedule: [],
    expectedReactions: [],
    warningSigns: [],
    contraindications: [],
    sourceName: "Banco de dados Vitta",
    sourceUrl: "",
    active: true,
    requiredDoses: vaccine.requiredDoses,
  };
}

function mapBatch(batch) {
  return {
    id: batch.id,
    vaccineId: batch.vaccine?.id || "",
    vaccineName: batch.vaccine?.name || "Vacina não informada",
    vaccineRequiredDoses: batch.vaccine?.requiredDoses ?? null,
    manufacturer: batch.manufacturer || "",
    batchCode: batch.batchCode || "",
    initialQuantity:
      typeof batch.initialQuantity === "number"
        ? batch.initialQuantity
        : 0,
    currentQuantity:
      typeof batch.currentQuantity === "number"
        ? batch.currentQuantity
        : 0,
    manufacturingDate: batch.manufacturingDate || "",
    expirationDate: batch.expirationDate || "",
  };
}

export function watchVaccines(onData, onError) {
  return subscribe(
    listVaccinesRef(),
    (result) => {
      const vaccines = result.data?.vaccines || [];
      const mapped = vaccines
        .map(mapVaccine)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

      onData(mapped);
    },
    onError,
  );
}

export function watchBatches(onData, onError) {
  return subscribe(
    listBatchesRef(),
    (result) => {
      const batches = result.data?.batches || [];
      const mapped = batches
        .map(mapBatch)
        .sort((a, b) => {
          const vaccineComparison = a.vaccineName.localeCompare(
            b.vaccineName,
            "pt-BR",
          );

          if (vaccineComparison !== 0) {
            return vaccineComparison;
          }

          return a.batchCode.localeCompare(b.batchCode, "pt-BR");
        });

      onData(mapped);
    },
    onError,
  );
}

export async function addVaccine({ name, description, requiredDoses }) {
  return createVaccine({
    name,
    description: description || null,
    requiredDoses,
  });
}

export async function editVaccine(
  id,
  { name, description, requiredDoses },
) {
  return updateVaccine({
    id,
    name,
    description: description || null,
    requiredDoses,
  });
}

export async function removeVaccine(id) {
  return deleteVaccine({ id });
}

export async function addBatch({
  vaccineId,
  manufacturer,
  batchCode,
  initialQuantity,
  currentQuantity,
  manufacturingDate,
  expirationDate,
}) {
  return createBatch({
    vaccineId,
    manufacturer,
    batchCode,
    initialQuantity,
    currentQuantity,
    manufacturingDate: manufacturingDate || null,
    expirationDate,
  });
}

export async function editBatch(
  id,
  {
    vaccineId,
    manufacturer,
    batchCode,
    initialQuantity,
    currentQuantity,
    manufacturingDate,
    expirationDate,
  },
) {
  return updateBatch({
    id,
    vaccineId,
    manufacturer,
    batchCode,
    initialQuantity,
    currentQuantity,
    manufacturingDate: manufacturingDate || null,
    expirationDate,
  });
}

export async function removeBatch(id) {
  return deleteBatch({ id });
}
