import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "./firebase";
import {
  AccessReason,
  AuthStatus,
  ProfessionalAuthResolutionError,
  performProfessionalLogout,
  resolveProfessionalIdentity,
} from "../utils/professionalAuth";

export async function resolveProfessional(firebaseUser) {
  try {
    return await resolveProfessionalIdentity(firebaseUser, {
      loadAuthLink: async (authUid) => {
        const snapshot = await getDoc(doc(db, "auth_links", authUid));
        return snapshot.exists()
          ? { exists: true, personId: snapshot.data().personId }
          : { exists: false };
      },
      loadUser: async (personId) => {
        const snapshot = await getDoc(doc(db, "users", personId));
        return snapshot.exists() ? snapshot.data() : null;
      },
    });
  } catch (error) {
    const stage =
      error instanceof ProfessionalAuthResolutionError
        ? error.stage
        : "unexpected";
    const code =
      error instanceof ProfessionalAuthResolutionError
        ? error.code
        : String(error?.code || "unknown").replace("firestore/", "");
    if (import.meta.env.DEV) {
      console.error("[ProfessionalAuth]", { stage, code });
    }
    return {
      status: AuthStatus.error,
      reason: "Não foi possível validar seu acesso neste momento.",
      reasonCode: AccessReason.validationFailed,
      validationStage: stage,
      firebaseUser,
      profile: null,
    };
  }
}

export async function loginWithEmail(email, password) {
  await firebaseReady;
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
}

export async function requestPasswordReset(email) {
  await firebaseReady;
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

export async function logout() {
  return performProfessionalLogout({
    storage: globalThis.sessionStorage,
    signOutUser: () => signOut(auth),
  });
}
