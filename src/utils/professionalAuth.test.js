import { describe, expect, it, vi } from "vitest";
import { friendlyFirebaseError } from "./firebaseErrors";
import {
  AccessReason,
  AuthStatus,
  authorizeProfessionalProfile,
  loginRouteDecision,
  performProfessionalLogout,
  primaryRoleLabel,
  protectedRouteDecision,
  resolveProfessionalIdentity,
} from "./professionalAuth";

const firebaseUser = { uid: "auth-uid-1" };

function authorize(profileData) {
  return authorizeProfessionalProfile({
    firebaseUser,
    personId: "person-1",
    profileData: {
      accountStatus: "active",
      canAuthenticate: true,
      ...profileData,
    },
  });
}

describe("professional authorization", () => {
  it("authorizes an active health professional", () => {
    const result = authorize({ roles: ["health_professional"] });
    expect(result.status).toBe(AuthStatus.authorized);
  });

  it("authorizes an active administrator", () => {
    const result = authorize({ roles: ["admin"] });
    expect(result.status).toBe(AuthStatus.authorized);
  });

  it("authorizes a profile with admin and health professional roles", () => {
    const result = authorize({ roles: ["admin", "health_professional"] });
    expect(result.status).toBe(AuthStatus.authorized);
  });

  it("blocks a profile without an accepted role", () => {
    const result = authorize({ roles: ["patient"] });
    expect(result.status).toBe(AuthStatus.unauthorized);
    expect(result.reasonCode).toBe(AccessReason.roleMissing);
  });

  it.each([
    ["pending", AccessReason.accountPending, "ainda não está ativo"],
    ["suspended", AccessReason.accountSuspended, "temporariamente suspensa"],
    ["inactive", AccessReason.accountInactive, "não está ativa"],
    ["disabled", AccessReason.accountInactive, "não está ativa"],
  ])("blocks accountStatus %s with a specific message", (status, code, text) => {
    const result = authorize({ roles: ["admin"], accountStatus: status });
    expect(result.reasonCode).toBe(code);
    expect(result.reason).toContain(text);
  });

  it("blocks an identity with canAuthenticate false", () => {
    const result = authorize({
      roles: ["health_professional"],
      canAuthenticate: false,
    });
    expect(result.reasonCode).toBe(AccessReason.authenticationDisabled);
    expect(result.reason).toContain("não possui acesso");
  });

  it("uses the exact authUid fallback when auth_link is absent", async () => {
    const loadUser = vi.fn(async () => ({
      roles: ["health_professional"],
      accountStatus: "active",
      canAuthenticate: true,
    }));
    const result = await resolveProfessionalIdentity(firebaseUser, {
      loadAuthLink: async () => ({ exists: false }),
      loadUser,
    });

    expect(loadUser).toHaveBeenCalledWith(firebaseUser.uid);
    expect(result.status).toBe(AuthStatus.authorized);
    expect(result.profile.personId).toBe(firebaseUser.uid);
  });

  it("reports a missing users profile after authentication", async () => {
    const result = await resolveProfessionalIdentity(firebaseUser, {
      loadAuthLink: async () => ({ exists: true, personId: "person-1" }),
      loadUser: async () => null,
    });

    expect(result.reasonCode).toBe(AccessReason.profileMissing);
    expect(result.reason).toContain("perfil profissional não está configurado");
  });

  it("does not use a legacy role when the roles array is present", () => {
    const result = authorize({ roles: ["patient"], role: "admin" });
    expect(result.reasonCode).toBe(AccessReason.roleMissing);
  });
});

describe("authentication experience", () => {
  it("maps an invalid credential without exposing Firebase details", () => {
    expect(friendlyFirebaseError({ code: "auth/invalid-credential" })).toBe(
      "E-mail ou senha incorretos.",
    );
  });

  it("maps a network failure to an actionable message", () => {
    expect(friendlyFirebaseError({ code: "auth/network-request-failed" })).toBe(
      "Não foi possível conectar ao Vitta. Verifique sua internet.",
    );
  });

  it("redirects a protected route without a session to login", () => {
    expect(protectedRouteDecision(AuthStatus.unauthenticated)).toBe("login");
    expect(protectedRouteDecision(AuthStatus.loading)).toBe("loading");
  });

  it("redirects login when the session is authorized", () => {
    expect(loginRouteDecision(AuthStatus.authorized)).toBe("dashboard");
    expect(protectedRouteDecision(AuthStatus.authorized)).toBe("content");
  });

  it("logout clears patient context but preserves visual preferences", async () => {
    const values = new Map([
      ["vitta:selectedPatientId", "person-1"],
      ["vitta:sidebarCollapsed", "true"],
    ]);
    const storage = {
      removeItem: vi.fn((key) => values.delete(key)),
    };
    const signOutUser = vi.fn(async () => {});

    await performProfessionalLogout({ storage, signOutUser });

    expect(storage.removeItem).toHaveBeenCalledWith("vitta:selectedPatientId");
    expect(values.get("vitta:sidebarCollapsed")).toBe("true");
    expect(signOutUser).toHaveBeenCalledOnce();
  });

  it("uses a readable administrator label", () => {
    expect(primaryRoleLabel({ roles: ["admin", "health_professional"] })).toBe(
      "Administrador",
    );
  });

  it("uses a readable health professional label", () => {
    expect(primaryRoleLabel({ roles: ["health_professional"] })).toBe(
      "Profissional de saúde",
    );
  });
});
