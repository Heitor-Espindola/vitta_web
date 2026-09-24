import { getCurrentPortalUser } from "@dataconnect/generated";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, firebaseReady } from "./firebase";

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
  const [profileResult, tokenResult] = await Promise.all([
    getCurrentPortalUser(),
    firebaseUser.getIdTokenResult(),
  ]);
  const sqlUser = profileResult?.data?.users?.[0];

  if (!sqlUser) {
    return {
      status: "unauthorized",
      reason: "O perfil profissional desta conta não foi encontrado.",
      firebaseUser,
      profile: null,
    };
  }

  const sqlProfessional = sqlUser.professional_on_user || null;
  const isAdmin = tokenResult?.claims?.admin === true;
  const isActive = sqlUser.status === "ACTIVE";
  const hasProfessionalRole = sqlUser.portalRole === "PROFESSIONAL";
  const hasActiveProfessional = sqlProfessional?.active === true;
  const authorized =
    isActive &&
    ((isAdmin && ["PROFESSIONAL", "ADMIN"].includes(sqlUser.portalRole)) ||
      (hasProfessionalRole && hasActiveProfessional));

  const profile = {
    ...sqlUser,
    personId: sqlUser.id,
    authUid: firebaseUser.uid,
    accountStatus: isActive ? "active" : "inactive",
    fullName: sqlUser.name,
    roles: [
      ...(hasProfessionalRole ? ["health_professional"] : []),
      ...(isAdmin ? ["admin"] : []),
    ],
    professional: sqlProfessional,
  };

  if (!authorized || !isAuthorizedProfessional(profile)) {
    return {
      status: "unauthorized",
      reason: !isActive
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
