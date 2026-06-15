const API_URL = "http://localhost:3001";

export async function getPacientes() {
  const res = await fetch(`${API_URL}/pacientes`);
  return res.json();
}

export async function createPaciente(data) {
  const res = await fetch(`${API_URL}/pacientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function updatePaciente(id, data) {
  const res = await fetch(`${API_URL}/pacientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function deletePaciente(id) {
  await fetch(`${API_URL}/pacientes/${id}`, {
    method: "DELETE"
  });
}