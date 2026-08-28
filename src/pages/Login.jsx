import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import isologo from "../assets/isologo.png";
import isotipo from "../assets/isotipo.png";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { friendlyFirebaseError } from "../utils/firebaseErrors";

export default function Login() {
  const { status, reason, login, requestPasswordReset } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authorized") navigate("/", { replace: true });
  }, [status, navigate]);

  const accessError =
    status === "unauthorized" || status === "error"
      ? reason || "Não foi possível validar o acesso profissional."
      : "";

  if (status === "authorized") return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
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
        title: "E-mail enviado",
        message: "Confira sua caixa de entrada para redefinir a senha.",
      });
    } catch (resetError) {
      setError(friendlyFirebaseError(resetError));
    } finally {
      setResetting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-story__glow" />
        <div className="login-story__brand">
          <img src={isotipo} alt="" />
          <img src={isologo} alt="Vitta" />
          <span>Profissional</span>
        </div>
        <div className="login-story__content">
          <span className="eyebrow eyebrow--light">Cuidado conectado</span>
          <h1>Informação segura para cada decisão de cuidado.</h1>
          <p>
            Localize pacientes, registre aplicações e mantenha a carteira
            digital atualizada em tempo real.
          </p>
          <div className="login-feature-grid">
            <article>
              <ShieldCheck />
              <div>
                <strong>Acesso profissional</strong>
                <span>Permissões verificadas pelo Firebase</span>
              </div>
            </article>
            <article>
              <Stethoscope />
              <div>
                <strong>Atendimento simples</strong>
                <span>CPF, carteira e aplicação em poucos passos</span>
              </div>
            </article>
          </div>
        </div>
        <p className="login-story__footer">Vitta • Saúde que acompanha a vida</p>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card__mobile-brand">
            <img src={isotipo} alt="" />
            <img src={isologo} alt="Vitta" />
          </div>
          <span className="eyebrow">Portal do profissional</span>
          <h2>Bem-vindo de volta</h2>
          <p className="login-card__subtitle">
            Use suas credenciais profissionais para acessar o painel.
          </p>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <label className="field">
              <span>E-mail profissional</span>
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
              <span>Sessão persistente neste dispositivo</span>
              <button type="button" onClick={handleReset} disabled={resetting}>
                {resetting ? "Enviando..." : "Esqueci minha senha"}
              </button>
            </div>

            {error || accessError ? (
              <div className="inline-alert inline-alert--error">
                {error || accessError}
              </div>
            ) : null}

            <button className="button button--primary button--large" disabled={loading}>
              {loading ? <span className="button-spinner" /> : null}
              {loading ? "Validando acesso..." : "Entrar no painel"}
              {!loading ? <ArrowRight size={19} /> : null}
            </button>
          </form>

          <div className="login-card__security">
            <ShieldCheck size={17} />
            <span>Acesso restrito a profissionais ativos e autorizados.</span>
          </div>

          <p className="login-card__access-note">
            <strong>Ainda não possui acesso?</strong> Procure o administrador
            responsável pela sua unidade.
          </p>
        </div>
      </section>
    </main>
  );
}
