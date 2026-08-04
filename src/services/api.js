import { db } from "./firebase";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

const API_URL = "http://localhost:3001";

export async function getPacientes() {
  const snapshot = await getDocs(
    collection(db, "users")
  );

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createPaciente(data) {
  await addDoc(
    collection(db, "pacientes"),
    data
  );
}

export async function updatePaciente(id, data) {
  const ref = doc(
    db,
    "pacientes",
    id
  );

  await updateDoc(ref, data);
}

export async function deletePaciente(id) {
  await deleteDoc(
    doc(db, "pacientes", id)
  );
}




export async function getVacinas() {
  const res = await fetch(`${API_URL}/vacinas`);
  return res.json();
}

export async function createVacina(data) {
  const res = await fetch(`${API_URL}/vacinas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function updateVacina(id, data) {
  const res = await fetch(`${API_URL}/vacinas/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function deleteVacina(id) {
  await fetch(`${API_URL}/vacinas/${id}`, {
    method: "DELETE"
  });
}




export async function getAplicacoes() {
  const res = await fetch(`${API_URL}/aplicacoes`);
  return res.json();
}

export async function createAplicacao(data) {
  const res = await fetch(`${API_URL}/aplicacoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function updateAplicacao(id, data) {
  const res = await fetch(`${API_URL}/aplicacoes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function deleteAplicacao(id) {
  await fetch(`${API_URL}/aplicacoes/${id}`, {
    method: "DELETE"
  });
}




export async function getUsuarios() {
  const res = await fetch(`${API_URL}/usuarios`);

  return res.json();
}

