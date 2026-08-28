import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";
import {
  firebaseConfig,
  useFirebaseEmulators,
} from "../config/firebase";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

if (useFirebaseEmulators && !globalThis.__VITTA_EMULATORS_CONNECTED__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  globalThis.__VITTA_EMULATORS_CONNECTED__ = true;
}

export const firebaseReady = setPersistence(auth, browserLocalPersistence);

export default app;
