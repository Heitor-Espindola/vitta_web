import { primaryRoleLabel } from "./professionalAuth";

export const accountSettingsCapabilities = Object.freeze({
  canEditRole: false,
  canEditAccountStatus: false,
  showsTechnicalIds: false,
  canResetPassword: true,
  canLogout: true,
});

export const accountStatusLabels = Object.freeze({
  active: "Ativa",
  pending: "Aguardando ativação",
  suspended: "Suspensa",
  inactive: "Inativa",
  disabled: "Inativa",
});

export function accountStatusLabel(status) {
  return accountStatusLabels[status] || "Não informado";
}

export function buildAccountSummary(profile = {}, firebaseUser = {}) {
  const safeProfile = profile || {};
  const safeUser = firebaseUser || {};
  return {
    name: safeProfile.fullName || safeProfile.name || "Profissional Vitta",
    email: safeProfile.email || safeUser.email || "",
    role: primaryRoleLabel(safeProfile),
    accountStatus: safeProfile.accountStatus || "",
    accountStatusLabel: accountStatusLabel(safeProfile.accountStatus),
    facilityName:
      safeProfile.facilityName || safeProfile.unitName || "",
  };
}
