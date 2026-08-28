import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "./firebase";

const professionalRoles = new Set(["health_professional", "admin"]);

export function profileRoles(profile = {}) {
  return [...new Set([...(profile.roles || []), profile.role].filter(Boolean))];
}

export function isAuthorizedProfessional(profile = {}) {
  return (
    profile.accountStatus === "active" &&
    profileRoles(profile).some((role) => professionalRoles.has(role))
  );
}

export async function resolveProfessional(firebaseUser) {
  const authLink = await getDoc(doc(db, "auth_links", firebaseUser.uid));
  const linkedPersonId = authLink.exists()
    ? String(authLink.data().personId || "").trim()
    : "";
  const personId = linkedPersonId || firebaseUser.uid;
  const profileSnapshot = await getDoc(doc(db, "users", personId));

  if (!profileSnapshot.exists()) {
    return {
      status: "unauthorized",
      reason: "O perfil profissional desta conta não foi encontrado.",
      firebaseUser,
      profile: null,
    };
  }

  const profile = {
    ...profileSnapshot.data(),
    personId,
    authUid: firebaseUser.uid,
    roles: profileRoles(profileSnapshot.data()),
  };

  if (!isAuthorizedProfessional(profile)) {
    const isBlocked = profile.accountStatus !== "active";
    return {
      status: "unauthorized",
      reason: isBlocked
        ? "Esta conta profissional não está ativa."
        : "Esta conta não possui perfil profissional autorizado.",
      firebaseUser,
      profile,
    };
  }

  return { status: "authorized", firebaseUser, profile, reason: null };
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
  sessionStorage.removeItem("vitta:selectedPatientId");
  return signOut(auth);
}
