import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import isologo from "../assets/isologo.png";
import isotipo from "../assets/isotipo.png";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { friendlyFirebaseError } from "../utils/firebaseErrors";
import {
  AccessReason,
  AuthStatus,
  loginRouteDecision,
} from "../utils/professionalAuth";

function accessTitle(reasonCode) {
  if (reasonCode === AccessReason.profileMissing) {
    return "Perfil profissional não configurado";
  }
  if (reasonCode === AccessReason.accountSuspended) {
    return "Conta temporariamente suspensa";
  }
  if (reasonCode === AccessReason.accountPending) {
    return "Acesso aguardando ativação";
  }
  return "Acesso ao portal indisponível";
}

export default function Login() {
  const {
    status,
    reason,
    reasonCode,
    firebaseUser,
    login,
    logout,
    refreshProfile,
    requestPasswordReset,
  } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  const routeDecision = loginRouteDecision(status);
  const isCheckingSession = routeDecision === "loading" && !loading;
  const hasAuthenticatedAccessProblem =
    Boolean(firebaseUser) &&
    (status === AuthStatus.unauthorized || status === AuthStatus.error);

  if (routeDecision === "dashboard") {
    return <Navigate to="/dashboard" replace />;
  }

  if (isCheckingSession) {
    return (
      <main className="login-session-check" role="status">
        <div className="brand-loader" aria-label="Verificando sessão">
          <img src={isotipo} alt="" />
          <span />
        </div>
        <h1>Portal Profissional</h1>
        <p>Verificando sua sessão com segurança.</p>
      </main>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!email.trim() || !password) {
      setError("Informe seu e-mail e sua senha.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (authError) {
      setError(friendlyFirebaseError(authError, "Não foi possível entrar."));
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (resetting) return;
    setError("");
    if (!email.trim()) {
      setError("Informe seu e-mail antes de solicitar a recuperação.");
      return;
    }
    setResetting(true);
    try {
      await requestPasswordReset(email);
      showToast({
        tone: "success",
        title: "Solicitação recebida",
        message:
          "Se existir uma conta com este e-mail, enviaremos instruções para redefinir a senha.",
      });
    } catch (resetError) {
      if (resetError?.code === "auth/user-not-found") {
        showToast({
          tone: "success",
          title: "Solicitação recebida",
          message:
            "Se existir uma conta com este e-mail, enviaremos instruções para redefinir a senha.",
        });
      } else {
        setError(friendlyFirebaseError(resetError));
      }
    } finally {
      setResetting(false);
    }
  }

  async function handleLogout() {
    setPassword("");
    setError("");
    await logout();
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-story__brand">
          <img src={isotipo} alt="" />
          <img src={isologo} alt="Vitta" />
          <span>Portal Profissional</span>
        </div>
        <div className="login-story__content">
          <span className="eyebrow eyebrow--light">Acesso institucional</span>
          <h1>Portal Profissional</h1>
          <p>
            Acesse o painel para consultar carteiras e registrar aplicações.
          </p>
          <div className="login-story__trust">
            <ShieldCheck aria-hidden="true" />
            <span>Acesso exclusivo para contas ativas e autorizadas.</span>
          </div>
        </div>
        <p className="login-story__footer">Vitta • Portal Profissional</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__mobile-brand">
            <img src={isotipo} alt="" />
            <img src={isologo} alt="Vitta" />
            <span>Portal Profissional</span>
          </div>
          {hasAuthenticatedAccessProblem ? (
            <section className="login-access-state" aria-live="polite">
              <span className="login-access-state__icon">
                <ShieldCheck aria-hidden="true" />
              </span>
              <span className="eyebrow">Acesso restrito</span>
              <h2>{accessTitle(reasonCode)}</h2>
              <p>{reason || "Não foi possível validar seu acesso neste momento."}</p>
              <div className="login-access-state__actions">
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => refreshProfile()}
                >
                  Verificar novamente
                </button>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={handleLogout}
                >
                  Sair desta conta
                </button>
              </div>
            </section>
          ) : (
            <>
              <span className="eyebrow">Acesso restrito</span>
              <h2>Entrar</h2>
              <p className="login-card__subtitle">
                Use suas credenciais profissionais para acessar o painel.
              </p>

              <form
                onSubmit={handleSubmit}
                className="login-form"
                noValidate
                aria-busy={loading}
              >
            <label className="field">
              <span>E-mail</span>
              <div className="input-with-icon">
                <Mail size={19} aria-hidden="true" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="profissional@exemplo.com"
                  autoFocus
                />
              </div>
            </label>

            <label className="field">
              <span>Senha</span>
              <div className="input-with-icon input-with-action">
                <LockKeyhole size={19} aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>

            <div className="login-form__support">
              <button type="button" onClick={handleReset} disabled={resetting}>
                {resetting ? "Enviando..." : "Esqueci minha senha"}
              </button>
            </div>

            {error || (status === AuthStatus.error ? reason : "") ? (
              <div
                className="inline-alert inline-alert--error"
                role="alert"
                aria-live="assertive"
              >
                {error || reason}
              </div>
            ) : null}

            <button
              className="button button--primary button--large"
              type="submit"
              disabled={loading}
            >
              {loading ? <span className="button-spinner" /> : null}
              {loading ? "Validando acesso..." : "Entrar no painel"}
              {!loading ? <ArrowRight size={19} /> : null}
            </button>
          </form>

              <div className="login-card__security">
                <ShieldCheck size={17} />
                <span>Acesso protegido pelo Firebase.</span>
              </div>

              <p className="login-card__access-note">
                <strong>Não possui acesso?</strong> Procure o administrador
                responsável pela sua unidade.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
