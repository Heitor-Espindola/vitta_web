import { Navigate, Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import isotipo from "../assets/isotipo.png";

export default function ProfessionalRoute() {
  const { status, reason, logout, refreshProfile } = useAuth();

  if (status === "loading") {
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

  if (status === "notAuthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "unauthorized") {
    return (
      <div className="auth-state-page">
        <div className="state-icon state-icon--danger">
          <ShieldAlert aria-hidden="true" />
        </div>
        <span className="eyebrow">Acesso restrito</span>
        <h1>Conta sem acesso ao painel</h1>
        <p>{reason}</p>
        <div className="button-row">
          <button className="button button--secondary" onClick={refreshProfile}>
            Verificar novamente
          </button>
          <button className="button button--primary" onClick={logout}>
            Sair desta conta
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="auth-state-page">
        <div className="state-icon state-icon--danger">
          <ShieldAlert aria-hidden="true" />
        </div>
        <h1>Não foi possível validar o acesso</h1>
        <p>{reason}</p>
        <button className="button button--primary" onClick={refreshProfile}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return <Outlet />;
}
