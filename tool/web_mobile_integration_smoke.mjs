import { createHash } from "node:crypto";
import { deleteApp, initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

const projectId = process.env.GCLOUD_PROJECT || "vitta-5ec1e";
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const firestoreHost =
  process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const databaseRoot = `projects/${projectId}/databases/(default)`;
const firestoreApi = `http://${firestoreHost}/v1/${databaseRoot}`;
const password = "VittaSmoke123!";
const patientCpf = "52998224725";

const string = (value) => ({ stringValue: value });
const strings = (values) => ({ arrayValue: { values: values.map(string) } });
const timestamp = () => ({ timestampValue: new Date().toISOString() });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createAuthUser(label) {
  const email = `${label}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
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

const documentName = (path) => `${databaseRoot}/documents/${path}`;

async function adminCommit(writes) {
  const response = await fetch(`${firestoreApi}/documents:commit`, {
    method: "POST",
    headers: {
      authorization: "Bearer owner",
      "content-type": "application/json",
    },
    body: JSON.stringify({ writes }),
  });
  assert(response.ok, `Seed do Firestore retornou ${response.status}.`);
}

function createDocument(path, fields) {
  return {
    update: { name: documentName(path), fields },
    currentDocument: { exists: false },
  };
}

function waitForRecord(database, patientId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("Listener não recebeu a aplicação em tempo real."));
    }, 8000);
    const recordsQuery = query(
      collection(database, "vaccination_records"),
      where("patientId", "==", patientId),
      orderBy("appliedAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const match = snapshot.docs.find(
          (item) => item.data().source === "professional_panel",
        );
        if (!match) return;
        clearTimeout(timeout);
        unsubscribe();
        resolve({ id: match.id, ...match.data() });
      },
      (error) => {
        clearTimeout(timeout);
        unsubscribe();
        reject(error);
      },
    );
  });
}

const professional = await createAuthUser("professional-web-smoke");
const patient = await createAuthUser("patient-mobile-smoke");
const cpfHash = createHash("sha256").update(patientCpf).digest("hex");

await adminCommit([
  createDocument(`users/${professional.uid}`, {
    uid: string(professional.uid),
    id: string(professional.uid),
    personId: string(professional.uid),
    authUid: string(professional.uid),
    name: string("Profissional Smoke"),
    fullName: string("Profissional Smoke"),
    email: string(professional.email),
    role: string("health_professional"),
    roles: strings(["health_professional"]),
    accountStatus: string("active"),
  }),
  createDocument(`auth_links/${professional.uid}`, {
    personId: string(professional.uid),
    createdAt: timestamp(),
  }),
  createDocument(`users/${patient.uid}`, {
    uid: string(patient.uid),
    id: string(patient.uid),
    personId: string(patient.uid),
    authUid: string(patient.uid),
    name: string("Paciente Integração"),
    fullName: string("Paciente Integração"),
    email: string(patient.email),
    role: string("responsible"),
    roles: strings(["user"]),
    accountStatus: string("active"),
    cpf: string(patientCpf),
    cpfDigits: string(patientCpf),
    cpfFormatted: string("529.982.247-25"),
    managedByUserIds: strings([]),
    birthDate: { timestampValue: "1990-05-20T12:00:00.000Z" },
  }),
  createDocument(`auth_links/${patient.uid}`, {
    personId: string(patient.uid),
    createdAt: timestamp(),
  }),
  createDocument(`cpf_registry/${cpfHash}`, {
    ownerUid: string(patient.uid),
    createdAt: timestamp(),
  }),
  createDocument("vaccines/bcg", {
    name: string("BCG"),
    active: { booleanValue: true },
    sourceName: string("Calendário oficial de teste"),
  }),
]);

const firebaseConfig = {
  apiKey: "fake-key",
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  appId: "1:123:web:smoke",
};

const professionalApp = initializeApp(firebaseConfig, "professional-smoke");
const patientApp = initializeApp(firebaseConfig, "patient-smoke");
const professionalAuth = getAuth(professionalApp);
const patientAuth = getAuth(patientApp);
const professionalDb = getFirestore(professionalApp);
const patientDb = getFirestore(patientApp);
connectAuthEmulator(professionalAuth, `http://${authHost}`, {
  disableWarnings: true,
});
connectAuthEmulator(patientAuth, `http://${authHost}`, {
  disableWarnings: true,
});
const [firestoreAddress, firestorePort] = firestoreHost.split(":");
connectFirestoreEmulator(
  professionalDb,
  firestoreAddress,
  Number(firestorePort),
);
connectFirestoreEmulator(patientDb, firestoreAddress, Number(firestorePort));

await Promise.all([
  signInWithEmailAndPassword(professionalAuth, professional.email, password),
  signInWithEmailAndPassword(patientAuth, patient.email, password),
]);

const authLink = await getDoc(
  doc(professionalDb, "auth_links", professionalAuth.currentUser.uid),
);
assert(authLink.data().personId === professional.uid, "auth_links inválido.");
const profile = await getDoc(doc(professionalDb, "users", professional.uid));
assert(
  profile.data().roles.includes("health_professional") &&
    profile.data().accountStatus === "active",
  "Guard profissional não reconheceu role/status.",
);

const registry = await getDoc(doc(professionalDb, "cpf_registry", cpfHash));
const patientId = registry.data().personId || registry.data().ownerUid;
assert(patientId === patient.uid, "Lookup do CPF não resolveu personId.");

await setDoc(
  doc(
    professionalDb,
    "professional_patient_access",
    `${professional.uid}_${patientId}`,
  ),
  {
    professionalUid: professional.uid,
    patientId,
    cpfHash,
    expiresAt: Timestamp.fromMillis(Date.now() + 20 * 60 * 1000),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  },
);
assert(
  (await getDoc(doc(professionalDb, "users", patientId))).exists(),
  "GET específico do paciente falhou após lookup.",
);

const professionalListener = waitForRecord(professionalDb, patientId);
const mobileListener = waitForRecord(patientDb, patientId);
const created = await addDoc(collection(professionalDb, "vaccination_records"), {
  patientId,
  vaccineId: "bcg",
  vaccineName: "BCG",
  doseLabel: "Dose única",
  appliedAt: Timestamp.fromDate(new Date("2026-08-28T12:00:00.000Z")),
  lot: "SMOKE-2026",
  manufacturer: "Instituto de Teste",
  facilityName: "UBS Emulator",
  professionalUid: professionalAuth.currentUser.uid,
  source: "professional_panel",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const [webRecord, mobileRecord] = await Promise.all([
  professionalListener,
  mobileListener,
]);
assert(webRecord.id === created.id, "Listener Web recebeu registro incorreto.");
assert(mobileRecord.id === created.id, "Listener Mobile recebeu registro incorreto.");
assert(mobileRecord.patientId === patientId, "Mobile não recebeu patientId.");
assert(
  mobileRecord.professionalUid === professional.uid,
  "professionalUid não veio do Auth.",
);
assert(!("patientUid" in mobileRecord), "Web gravou patientUid legado.");
assert(!("status" in mobileRecord), "Web gravou status derivado.");
assert(
  mobileRecord.appliedAt instanceof Timestamp,
  "appliedAt não chegou como Timestamp.",
);

await Promise.all([deleteApp(professionalApp), deleteApp(patientApp)]);
console.log(
  "Integração Emulator: login profissional → CPF → aplicação → listeners Web/Mobile aprovada.",
);
