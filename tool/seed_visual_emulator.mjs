import { createHash } from "node:crypto";

const projectId = process.env.GCLOUD_PROJECT || "vitta-5ec1e";
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const firestoreHost =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const databaseRoot = `projects/${projectId}/databases/(default)`;
const firestoreApi = `http://${firestoreHost}/v1/${databaseRoot}`;
const password = "VittaVisual123!";
const patientCpf = "52998224725";

const string = (value) => ({ stringValue: value });
const boolean = (value) => ({ booleanValue: value });
const integer = (value) => ({ integerValue: String(value) });
const strings = (values) => ({ arrayValue: { values: values.map(string) } });
const timestamp = (value = new Date().toISOString()) => ({ timestampValue: value });
const documentName = (path) => `${databaseRoot}/documents/${path}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createAuthUser(email) {
  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const body = await response.json();
  assert(response.ok, `Auth Emulator retornou ${response.status}.`);
  return { uid: body.localId, email };
}

function createDocument(path, fields) {
  return {
    update: { name: documentName(path), fields },
    currentDocument: { exists: false },
  };
}

async function adminCommit(writes) {
  const response = await fetch(`${firestoreApi}/documents:commit`, {
    method: "POST",
    headers: {
      authorization: "Bearer owner",
      "content-type": "application/json",
    },
    body: JSON.stringify({ writes }),
  });
  assert(response.ok, `Firestore Emulator retornou ${response.status}.`);
}

const professional = await createAuthUser("profissional@vitta.test");
const patient = await createAuthUser("paciente@vitta.test");
const cpfHash = createHash("sha256").update(patientCpf).digest("hex");

const vaccines = [
  ["bcg", "BCG", "Ajuda a proteger contra formas graves da tuberculose.", "Ao nascer", ["Tuberculose"]],
  ["hepatite-b", "Hepatite B", "Proteção contra a infecção pelo vírus da hepatite B.", "Todas as idades", ["Hepatite B"]],
  ["influenza", "Influenza", "Reduz o risco de complicações causadas pela gripe.", "A partir de 6 meses", ["Influenza"]],
  ["triplice-viral", "Tríplice viral", "Protege contra sarampo, caxumba e rubéola.", "Crianças e adultos", ["Sarampo", "Caxumba", "Rubéola"]],
];

const writes = [
  createDocument(`users/${professional.uid}`, {
    uid: string(professional.uid), id: string(professional.uid), personId: string(professional.uid), authUid: string(professional.uid),
    name: string("Dra. Helena Martins"), fullName: string("Dra. Helena Martins"), email: string(professional.email),
    role: string("health_professional"), roles: strings(["health_professional"]), accountStatus: string("active"),
  }),
  createDocument(`auth_links/${professional.uid}`, { personId: string(professional.uid), createdAt: timestamp() }),
  createDocument(`users/${patient.uid}`, {
    uid: string(patient.uid), id: string(patient.uid), personId: string(patient.uid), authUid: string(patient.uid),
    name: string("Mariana Oliveira"), fullName: string("Mariana Oliveira"), email: string(patient.email),
    role: string("responsible"), roles: strings(["user"]), accountStatus: string("active"),
    cpf: string(patientCpf), cpfDigits: string(patientCpf), cpfFormatted: string("529.982.247-25"),
    managedByUserIds: strings([]), birthDate: timestamp("1994-04-16T12:00:00.000Z"),
  }),
  createDocument(`auth_links/${patient.uid}`, { personId: string(patient.uid), createdAt: timestamp() }),
  createDocument(`cpf_registry/${cpfHash}`, { ownerUid: string(patient.uid), createdAt: timestamp() }),
];

for (const [id, name, description, recommendedAge, prevents] of vaccines) {
  writes.push(
    createDocument(`vaccines/${id}`, {
      name: string(name),
      description: string(description),
      recommendedAge: string(recommendedAge),
      prevents: strings(prevents),
      targetGroups: strings([recommendedAge]),
      doseCount: integer(id === "bcg" ? 1 : 2),
      sourceName: string("Calendário Nacional de Vacinação"),
      active: boolean(true),
    }),
  );
}

writes.push(
  createDocument("vaccination_records/visual-bcg", {
    patientId: string(patient.uid), vaccineId: string("bcg"), vaccineName: string("BCG"), doseLabel: string("Dose única"),
    appliedAt: timestamp("2026-07-12T12:00:00.000Z"), lot: string("BCG-260712"), manufacturer: string("Instituto Butantan"),
    facilityName: string("UBS Central"), professionalUid: string(professional.uid), source: string("professional_panel"),
    createdAt: timestamp("2026-07-12T15:00:00.000Z"), updatedAt: timestamp("2026-07-12T15:00:00.000Z"),
  }),
  createDocument("vaccination_records/visual-hepatite", {
    patientId: string(patient.uid), vaccineId: string("hepatite-b"), vaccineName: string("Hepatite B"), doseLabel: string("1ª dose"), doseNumber: integer(1),
    appliedAt: timestamp("2026-08-20T12:00:00.000Z"), nextDoseAt: timestamp("2026-09-20T12:00:00.000Z"), lot: string("HB-0826"),
    manufacturer: string("Instituto de Tecnologia em Imunobiológicos"), facilityName: string("UBS Central"), professionalUid: string(professional.uid),
    source: string("professional_panel"), createdAt: timestamp("2026-08-20T15:00:00.000Z"), updatedAt: timestamp("2026-08-20T15:00:00.000Z"),
  }),
);

await adminCommit(writes);
console.log("Fixtures visuais do Emulator prontas.");
