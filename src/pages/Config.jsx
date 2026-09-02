import {
  Building2,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { PageHeader, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  accountSettingsCapabilities,
  buildAccountSummary,
} from "../utils/accountPresentation";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

export default function Config() {
  const { profile, firebaseUser, logout, requestPasswordReset } = useAuth();
  const { showToast } = useToast();
  const [sendingReset, setSendingReset] = useState(false);
  const account = buildAccountSummary(profile, firebaseUser);

  async function handlePasswordReset() {
    if (!account.email || sendingReset) return;
    setSendingReset(true);
    try {
      await requestPasswordReset(account.email);
      showToast({
        tone: "success",
        title: "E-mail de redefinição enviado",
        message: `Enviamos as instruções para ${account.email}.`,
      });
    } catch (error) {
      showToast({
        tone: "error",
        title: "Não foi possível enviar o e-mail",
        message: friendlyFirebaseError(
          error,
          "Tente novamente em alguns instantes.",
        ),
      });
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Conta"
        title="Configurações"
        description="Gerencie informações da sua conta."
      />

      <section className="settings-grid">
        <article className="content-card profile-card">
          <span className="profile-card__avatar">
            <UserRound />
          </span>
          <div>
            <h2>{account.name}</h2>
            {account.email ? <p>{account.email}</p> : null}
            <StatusBadge status={account.accountStatus || "inactive"}>
              {account.accountStatusLabel}
            </StatusBadge>
          </div>
        </article>

        <article className="content-card settings-list">
          <header className="card-header">
            <div>
              <span className="eyebrow">Perfil</span>
              <h2>Informações profissionais</h2>
            </div>
            <ShieldCheck />
          </header>
          <dl>
            <div>
              <dt>
                <UserRound /> Nome
              </dt>
              <dd>{account.name}</dd>
            </div>
            {account.email ? (
              <div>
                <dt>
                  <Mail /> E-mail
                </dt>
                <dd>{account.email}</dd>
              </div>
            ) : null}
            <div>
              <dt>
                <ShieldCheck /> Acesso ao Portal
              </dt>
              <dd>{account.role}</dd>
            </div>
            <div>
              <dt>
                <ShieldCheck /> Status da conta
              </dt>
              <dd>{account.accountStatusLabel}</dd>
            </div>
            <div>
              <dt>
                <Building2 /> Unidade
              </dt>
              <dd>{account.facilityName || "Unidade não configurada."}</dd>
            </div>
          </dl>
          {!accountSettingsCapabilities.canEditRole ? (
            <p className="settings-note">
              Permissões e status são definidos pela administração responsável.
            </p>
          ) : null}
        </article>

        <article className="content-card security-settings">
          <header className="card-header">
            <div>
              <span className="eyebrow">Segurança</span>
              <h2>Acesso à conta</h2>
            </div>
            <KeyRound />
          </header>
          <div className="security-settings__action">
            <div>
              <strong>Redefinir senha</strong>
              <p>Receba por e-mail as instruções oficiais de redefinição.</p>
            </div>
            <button
              className="button button--secondary"
              type="button"
              onClick={handlePasswordReset}
              disabled={!account.email || sendingReset}
            >
              {sendingReset ? (
                <span className="button-spinner" />
              ) : (
                <Mail size={17} />
              )}
              {sendingReset ? "Enviando..." : "Enviar e-mail"}
            </button>
          </div>
        </article>

        <article className="content-card session-card">
          <div>
            <span className="feature-icon">
              <LogOut />
            </span>
            <h2>Sair da conta</h2>
            <p>Encerra com segurança a sessão atual neste navegador.</p>
          </div>
          <button
            className="button button--danger"
            type="button"
            onClick={logout}
          >
            <LogOut size={18} /> Sair da conta
          </button>
        </article>
      </section>
    </div>
  );
}
