import { subscribe } from "firebase/data-connect";
import {
  createUbs,
  deleteUbs,
  listUbsRef,
  updateUbs,
} from "@dataconnect/generated";

export function mapUBS(ubs) {
  return {
    id: ubs?.id || "",
    name: ubs?.name || "",
    logradouro: ubs?.logradouro || "",
    numero: ubs?.numero || "",
    bairro: ubs?.bairro || "",
    cidade: ubs?.cidade || "",
    cep: ubs?.cep || "",
  };
}

export function watchUBS(onData, onError) {
  return subscribe(
    listUbsRef(),
    (result) => {
      const items = (result?.data?.uBSs || [])
        .map(mapUBS)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      onData(items);
    },
    onError,
  );
}

export function addUBS(data) {
  return createUbs({
    name: data.name.trim(),
    logradouro: data.logradouro.trim() || null,
    numero: data.numero.trim() || null,
    bairro: data.bairro.trim() || null,
    cidade: data.cidade.trim() || null,
    cep: data.cep.trim() || null,
  });
}

export function editUBS(id, data) {
  return updateUbs({
    id,
    name: data.name.trim(),
    logradouro: data.logradouro.trim() || null,
    numero: data.numero.trim() || null,
    bairro: data.bairro.trim() || null,
    cidade: data.cidade.trim() || null,
    cep: data.cep.trim() || null,
  });
}

export function removeUBS(id) {
  return deleteUbs({ id });
}
