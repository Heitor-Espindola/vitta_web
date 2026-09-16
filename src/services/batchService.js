import { subscribe } from "firebase/data-connect";
import {
  createBatch,
  deleteBatch,
  listBatchesRef,
  updateBatch,
} from "@dataconnect/generated";

export function mapBatch(batch) {
  return {
    id: batch.id,

    vaccine: batch.vaccine
      ? {
          id: batch.vaccine.id,
          name: batch.vaccine.name,
          requiredDoses: batch.vaccine.requiredDoses,
        }
      : null,

    manufacturer: batch.manufacturer || "",
    batchCode: batch.batchCode || "",
    initialQuantity: Number(batch.initialQuantity || 0),
    currentQuantity: Number(batch.currentQuantity || 0),
    manufacturingDate: batch.manufacturingDate || null,
    expirationDate: batch.expirationDate || null,
  };
}

export function watchBatches(onData, onError) {
  const queryRef = listBatchesRef();

  return subscribe(
    queryRef,
    (result) => {
      const batches = result?.data?.batches || [];

      const mapped = batches.map(mapBatch).sort((a, b) => {
        const dateA = a.expirationDate || "";
        const dateB = b.expirationDate || "";

        return dateA.localeCompare(dateB);
      });

      onData(mapped);
    },
    (error) => {
      onError(error);
    },
  );
}

export async function createBatchRecord({
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
    manufacturer: manufacturer.trim(),
    batchCode: batchCode.trim(),
    initialQuantity: Number(initialQuantity),
    currentQuantity: Number(currentQuantity),
    manufacturingDate: manufacturingDate || null,
    expirationDate,
  });
}

export async function updateBatchRecord(
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
    manufacturer: manufacturer.trim(),
    batchCode: batchCode.trim(),
    initialQuantity: Number(initialQuantity),
    currentQuantity: Number(currentQuantity),
    manufacturingDate: manufacturingDate || null,
    expirationDate,
  });
}

export async function deleteBatchRecord(id) {
  return deleteBatch({
    id,
  });
}
