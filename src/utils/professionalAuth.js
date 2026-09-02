export const AuthStatus = Object.freeze({
  loading: "loading",
  unauthenticated: "unauthenticated",
  unauthorized: "authenticatedUnauthorized",
  authorized: "authenticatedAuthorized",
  error: "error",
});

export const AccessReason = Object.freeze({
  profileMissing: "profileMissing",
  authLinkInvalid: "authLinkInvalid",
  roleMissing: "roleMissing",
  authenticationDisabled: "authenticationDisabled",
  accountPending: "accountPending",
  accountSuspended: "accountSuspended",
  accountInactive: "accountInactive",
  validationFailed: "validationFailed",
});

const acceptedRoles = new Set(["admin", "health_professional"]);

export class ProfessionalAuthResolutionError extends Error {
  constructor(stage, cause) {
    super("Não foi possível validar o acesso profissional.");
    this.name = "ProfessionalAuthResolutionError";
    this.stage = stage;
    this.code = String(cause?.code || "unknown").replace("firestore/", "");
  }
}

export function profileRoles(profile = {}) {
  const currentRoles = Array.isArray(profile.roles)
    ? profile.roles
    : profile.role
      ? [profile.role]
      : [];
  return [
    ...new Set(
      currentRoles
        .map((role) => String(role || "").trim())
        .filter(Boolean),
    ),
  ];
}

export function primaryRoleLabel(profile = {}) {
  const roles = profileRoles(profile);
  if (roles.includes("admin")) return "Administrador";
  if (roles.includes("health_professional")) return "Profissional de saúde";
  return "Acesso profissional";
}

function unauthorized(firebaseUser, profile, reasonCode, reason) {
  return {
    status: AuthStatus.unauthorized,
    firebaseUser,
    profile,
    reasonCode,
    reason,
  };
}

export function authorizeProfessionalProfile({
  firebaseUser,
  personId,
  profileData,
}) {
  if (!profileData) {
    return unauthorized(
      firebaseUser,
      null,
      AccessReason.profileMissing,
      "Seu acesso foi autenticado, mas o perfil profissional não está configurado.",
    );
  }

  const profile = {
    ...profileData,
    personId,
    authUid: firebaseUser.uid,
    roles: profileRoles(profileData),
  };

  if (profile.canAuthenticate === false) {
    return unauthorized(
      firebaseUser,
      profile,
      AccessReason.authenticationDisabled,
      "Esta identidade não possui acesso ao Portal Profissional.",
    );
  }

  const accountStatus = String(profile.accountStatus || "").toLowerCase();
  if (accountStatus !== "active") {
    if (accountStatus === "pending") {
      return unauthorized(
        firebaseUser,
        profile,
        AccessReason.accountPending,
        "Seu acesso ainda não está ativo.",
      );
    }
    if (accountStatus === "suspended") {
      return unauthorized(
        firebaseUser,
        profile,
        AccessReason.accountSuspended,
        "Esta conta está temporariamente suspensa.",
      );
    }
    return unauthorized(
      firebaseUser,
      profile,
      AccessReason.accountInactive,
      "Esta conta não está ativa.",
    );
  }

  if (!profile.roles.some((role) => acceptedRoles.has(role))) {
    return unauthorized(
      firebaseUser,
      profile,
      AccessReason.roleMissing,
      "Esta conta não possui acesso ao Portal Profissional.",
    );
  }

  return {
    status: AuthStatus.authorized,
    firebaseUser,
    profile,
    reasonCode: null,
    reason: null,
  };
}

export async function resolveProfessionalIdentity(
  firebaseUser,
  { loadAuthLink, loadUser },
) {
  let authLink;
  try {
    authLink = await loadAuthLink(firebaseUser.uid);
  } catch (error) {
    throw new ProfessionalAuthResolutionError("authLink", error);
  }

  const hasAuthLink = authLink?.exists === true;
  const linkedPersonId = hasAuthLink
    ? String(authLink.personId || "").trim()
    : "";
  if (hasAuthLink && !linkedPersonId) {
    return unauthorized(
      firebaseUser,
      null,
      AccessReason.authLinkInvalid,
      "Não encontramos um perfil Vitta vinculado a esta conta.",
    );
  }

  // Compatibilidade legada segura: sem auth_link, consulta somente users/{authUid}.
  // O navegador nunca cria ou procura vínculos alternativos automaticamente.
  const personId = linkedPersonId || firebaseUser.uid;
  let profileData;
  try {
    profileData = await loadUser(personId);
  } catch (error) {
    throw new ProfessionalAuthResolutionError("userProfile", error);
  }

  return authorizeProfessionalProfile({
    firebaseUser,
    personId,
    profileData,
  });
}

export function protectedRouteDecision(status) {
  if (status === AuthStatus.loading) return "loading";
  if (status === AuthStatus.unauthenticated) return "login";
  if (status === AuthStatus.authorized) return "content";
  return "accessState";
}

export function loginRouteDecision(status) {
  if (status === AuthStatus.loading) return "loading";
  if (status === AuthStatus.authorized) return "dashboard";
  return "login";
}

export async function performProfessionalLogout({ storage, signOutUser }) {
  storage?.removeItem("vitta:selectedPatientId");
  await signOutUser();
}
