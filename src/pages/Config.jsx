import {
  ArrowRight,
  Database,
  LogOut,
  Mail,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  Type,
  UserCog,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useAppearance } from "../context/AppearanceContext";

export default function Config() {
  const { profile, firebaseUser, logout, isAdmin } = useAuth();
  const {
    fontSize,
    setFontSize,
    resetFontSize,
    minFontSize,
    maxFontSize,
  } = useAppearance();

  const name = profile?.fullName || profile?.name || "Profissional Vitta";

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Conta e segurança"
        title="Configurações"
        description="Informações reais da sessão e do ambiente conectado."
      />

      <section className="settings-grid">
        <article className="content-card profile-card">
          <span className="profile-card__avatar">
            <UserRound />
          </span>

          <div>
            <h2>{name}</h2>
            <p>{profile?.email || firebaseUser?.email}</p>
            <StatusBadge status="active">Conta ativa</StatusBadge>
          </div>
        </article>

        <article className="content-card settings-list">
          <header className="card-header">
            <div>
              <span className="eyebrow">Perfil</span>
              <h2>Acesso profissional</h2>
            </div>

            <ShieldCheck />
          </header>

          <dl>
            <div>
              <dt>
                <Mail /> E-mail
              </dt>
              <dd>{profile?.email || firebaseUser?.email}</dd>
            </div>

            <div>
              <dt>
                <ShieldCheck /> Permissão
              </dt>
              <dd>
                {isAdmin ? "Administrador" : "Profissional do Vitta"}
              </dd>
            </div>

            <div>
              <dt>
                <Database /> Firebase
              </dt>
              <dd>vitta-5ec1e</dd>
            </div>
          </dl>
        </article>

        <article className="content-card session-card">
          <div>
            <span className="feature-icon">
              <UserCog />
            </span>

            <h2>Equipe e unidades</h2>

            <p>
              Cadastre seu perfil SQL, gerencie profissionais autorizados e
              mantenha as UBS usadas nos atendimentos.
            </p>
          </div>

          <Link
            className="button button--secondary"
            to="/funcionarios"
          >
            <UserCog size={18} />
            Abrir cadastros
            <ArrowRight size={17} />
          </Link>
        </article>

        <article className="content-card session-card">
          <div>
            <span className="feature-icon">
              <LogOut />
            </span>

            <h2>Encerrar sessão</h2>

            <p>
              Remove a sessão persistida deste navegador e encerra o acesso
              aos dados.
            </p>
          </div>

          <button
            className="button button--danger"
            type="button"
            onClick={logout}
          >
            <LogOut size={18} />
            Sair do Vitta
          </button>
        </article>

        <article className="content-card settings-list" style={{ "marginTop": "-2.5rem" }}>
          <section className="font-settings">
            <header className="font-settings__header">
              <div>
                <span className="eyebrow">Acessibilidade</span>
                <h3>Tamanho da fonte</h3>
              </div>
            </header>

            <div className="font-settings__value-row">
              <div>
                <span>Tamanho atual: </span>
                <strong> {fontSize}px</strong>
              </div>

              <button
                className="button button--secondary button--small"
                type="button"
                onClick={resetFontSize}
                disabled={fontSize === minFontSize}
                style={{ "marginTop": "0.12rem" }}
              >
                <RotateCcw size={15} />
                Restaurar
              </button>
            </div>

            <div className="font-settings__slider-row" style={{ "marginTop": "0.4rem" }}>
              <button
                className="icon-button"
                type="button"
                aria-label="Diminuir tamanho da fonte"
                onClick={() => setFontSize(fontSize - 1)}
                disabled={fontSize === minFontSize}
              >
                <Minus size={17} />
              </button>

              <input
                id="font-size-range"
                className="font-settings__range"
                type="range"
                min={minFontSize}
                max={maxFontSize}
                step="1"
                value={fontSize}
                onChange={(event) => setFontSize(event.target.value)}
                aria-label="Tamanho da fonte"
                aria-valuemin={minFontSize}
                aria-valuemax={maxFontSize}
                aria-valuenow={fontSize}
                aria-valuetext={`${fontSize} pixels`}
              />

              <button
                className="icon-button"
                type="button"
                aria-label="Aumentar tamanho da fonte"
                onClick={() => setFontSize(fontSize + 1)}
                disabled={fontSize === maxFontSize}
              >
                <Plus size={17} />
              </button>
            </div>
          </section>
        </article>
      </section>
    </div>
  );
}
