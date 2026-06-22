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