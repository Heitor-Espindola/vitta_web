import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";
import {
  firebaseConfig,
  useFirebaseEmulators,
} from "../config/firebase";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

if (useFirebaseEmulators && !globalThis.__VITTA_EMULATORS_CONNECTED__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });
  globalThis.__VITTA_EMULATORS_CONNECTED__ = true;
}

export const firebaseReady = setPersistence(auth, browserLocalPersistence);

export default app;
