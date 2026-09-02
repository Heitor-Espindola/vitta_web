import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  hasOnlySeedFields,
  vaccineNeedsUpdate,
  vaccineSeedCatalog,
} from '../src/data/vaccineSeedCatalog.js';

const projectId = process.env.VITTA_FIREBASE_PROJECT_ID || 'vitta-5ec1e';
if (projectId !== 'vitta-5ec1e') {
  throw new Error(`Seed bloqueado para o projeto inesperado: ${projectId}`);
}

const email = process.env.VITTA_SEED_EMAIL;
const password = process.env.VITTA_SEED_PASSWORD;
if (!email || !password) {
  throw new Error('Defina VITTA_SEED_EMAIL e VITTA_SEED_PASSWORD para uma conta admin de teste.');
}

const app = initializeApp({
  apiKey: process.env.VITTA_FIREBASE_API_KEY || 'AIzaSyCwH4dDAfqZznP11hjspsLtTrbB0hAE5GY',
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  appId: '1:733443225670:web:9334e443d9f13b0092b247',
});
const auth = getAuth(app);
const db = getFirestore(app);
const result = { created: 0, existing: 0, updated: 0, skipped: 0 };

try {
  await signInWithEmailAndPassword(auth, email, password);
  console.log(`Projeto confirmado: ${projectId}`);

  for (const entry of vaccineSeedCatalog) {
    const reference = doc(db, 'vaccines', entry.id);
    const snapshot = await getDoc(reference);
    const payload = {
      ...entry,
      sourceUpdatedAt: new Date(entry.sourceUpdatedAt),
    };

    if (!snapshot.exists()) {
      await setDoc(reference, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      result.created += 1;
      continue;
    }

    const existing = snapshot.data();
    if (!hasOnlySeedFields(existing)) {
      result.existing += 1;
      result.skipped += 1;
      continue;
    }
    if (!vaccineNeedsUpdate(existing, payload)) {
      result.existing += 1;
      continue;
    }
    await setDoc(reference, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
    result.updated += 1;
  }

  console.log(JSON.stringify(result));
  const visibleCatalog = await getDocs(
    query(collection(db, 'vaccines'), orderBy('name')),
  );
  const activeOptions = visibleCatalog.docs.filter(
    (snapshot) => snapshot.data().active !== false,
  );
  console.log(
    JSON.stringify({
      visibleCatalog: visibleCatalog.size,
      activeFormOptions: activeOptions.length,
      stableIdsPresent: vaccineSeedCatalog.every((entry) =>
        visibleCatalog.docs.some((snapshot) => snapshot.id === entry.id),
      ),
    }),
  );
} finally {
  await signOut(auth).catch(() => {});
  await deleteApp(app);
}
