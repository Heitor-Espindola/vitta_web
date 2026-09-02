import { Navigate, Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import isotipo from "../assets/isotipo.png";
import {
  AccessReason,
  AuthStatus,
  protectedRouteDecision,
} from "../utils/professionalAuth";

function unauthorizedTitle(reasonCode) {
  if (reasonCode === AccessReason.profileMissing) {
    return "Perfil profissional não configurado";
  }
  if (reasonCode === AccessReason.accountSuspended) {
    return "Conta temporariamente suspensa";
  }
  if (reasonCode === AccessReason.accountPending) {
    return "Acesso aguardando ativação";
  }
  return "Conta sem acesso ao painel";
}

export default function ProfessionalRoute() {
  const { status, reason, reasonCode, firebaseUser, logout, refreshProfile } =
    useAuth();
  const decision = protectedRouteDecision(status);

  if (decision === "loading") {
    return (
      <div className="auth-state-page">
        <div className="brand-loader" aria-label="Validando acesso">
          <img src={isotipo} alt="" />
          <span />
        </div>
        <h1>Preparando seu painel</h1>
        <p>Validando sessão e permissões profissionais.</p>
      </div>
    );
  }

  if (decision === "login") {
    return <Navigate to="/login" replace />;
  }

  if (status === AuthStatus.unauthorized) {
    return (
      <div className="auth-state-page">
        <div className="state-icon state-icon--danger">
          <ShieldAlert aria-hidden="true" />
        </div>
        <span className="eyebrow">Acesso restrito</span>
        <h1>{unauthorizedTitle(reasonCode)}</h1>
        <p>{reason}</p>
        <div className="button-row">
          <button
            className="button button--secondary"
            onClick={() => refreshProfile()}
          >
            Verificar novamente
          </button>
          <button className="button button--primary" onClick={logout}>
            Sair desta conta
          </button>
        </div>
      </div>
    );
  }

  if (status === AuthStatus.error) {
    return (
      <div className="auth-state-page">
        <div className="state-icon state-icon--danger">
          <ShieldAlert aria-hidden="true" />
        </div>
        <h1>Não foi possível validar o acesso</h1>
        <p>{reason}</p>
        <div className="button-row">
          <button
            className="button button--primary"
            onClick={() => refreshProfile()}
          >
            Tentar novamente
          </button>
          {firebaseUser ? (
            <button className="button button--secondary" onClick={logout}>
              Sair desta conta
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return <Outlet />;
}
