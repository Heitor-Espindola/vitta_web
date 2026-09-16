import { ChevronDown, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const pageNames = {
  "/": "Dashboard",
  "/pacientes": "Pacientes",
  "/carteiras": "Carteiras",
  "/aplicacoes": "Aplicações",
  "/vacinas": "Vacinas",
  "/relatorios": "Relatórios",
  "/config": "Configurações",
};

function pageName(pathname) {
  if (pathname.startsWith("/pacientes/")) return "Carteira do paciente";
  return pageNames[pathname] || "Vitta Profissional";
}

function initials(name = "Profissional") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Topbar({ onOpenMenu }) {
  const { pathname } = useLocation();
  const { profile, logout } = useAuth();
  const [accountOpen, setAccountOpen] = useState(false);
  const name = profile?.fullName || profile?.name || "Profissional Vitta";

  return (
    <header className="topbar">
      <div className="topbar__heading">
        <button
          className="icon-button topbar__menu"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          type="button"
        >
          <Menu size={21} />
        </button>
        <div>
          <span className="topbar__breadcrumb">Painel /</span>
          <strong>{pageName(pathname)}</strong>
        </div>
      </div>

      <div className="topbar__account-wrap">
        <button
          className="topbar__account"
          type="button"
          onClick={() => setAccountOpen((open) => !open)}
          aria-expanded={accountOpen}
        >
          <span className="avatar">{initials(name)}</span>
          <span className="topbar__identity">
            <strong>{name}</strong>
            <small>
              <ShieldCheck size={13} /> Profissional autorizado
            </small>
          </span>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
        {accountOpen ? (
          <div className="account-menu">
            <div>
              <strong>{name}</strong>
              <span>{profile?.email || "Conta profissional"}</span>
            </div>
            <button type="button" onClick={logout}>
              <LogOut size={17} /> Encerrar sessão
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
