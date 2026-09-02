import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";

export function mapVaccine(snapshot) {
  const data = snapshot.data();
  const sourceUrl = String(data.sourceUrl || "").trim();
  return {
    id: snapshot.id,
    name: data.name || data.vaccineName || "",
    shortName: data.shortName || "",
    description: data.description || "",
    recommendedAge: data.recommendedAge || "",
    doseCount: Number.isInteger(data.doseCount) ? data.doseCount : null,
    intervalDays: Number.isInteger(data.intervalDays)
      ? data.intervalDays
      : null,
    targetGroups: Array.isArray(data.targetGroups) ? data.targetGroups : [],
    prevents: Array.isArray(data.prevents) ? data.prevents : [],
    sourceName: data.sourceName || "",
    sourceUrl: /^https?:\/\//i.test(sourceUrl) ? sourceUrl : "",
    active: data.active !== false,
    hasActiveStatus: typeof data.active === "boolean",
  };
}

export function mapVaccineSnapshot(snapshot) {
  return snapshot.docs.map(mapVaccine).filter((vaccine) => vaccine.name);
}

export function watchVaccines(onData, onError) {
  const vaccineQuery = query(collection(db, "vaccines"), orderBy("name"));
  return onSnapshot(
    vaccineQuery,
    (snapshot) => onData(mapVaccineSnapshot(snapshot)),
    onError,
  );
}
