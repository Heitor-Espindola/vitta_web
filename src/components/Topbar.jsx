import { ChevronDown, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { primaryRoleLabel } from "../utils/professionalAuth";

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
  const accountRef = useRef(null);
  const name = profile?.fullName || profile?.name || "Profissional Vitta";
  const unitName = profile?.facilityName || profile?.unitName;
  const roleLabel = primaryRoleLabel(profile);
  const professionalContext = unitName
    ? `${roleLabel} • ${unitName}`
    : roleLabel;

  useEffect(() => {
    if (!accountOpen) return undefined;
    const closeMenu = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
      if (
        event.type === "pointerdown" &&
        !accountRef.current?.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("keydown", closeMenu);
    document.addEventListener("pointerdown", closeMenu);
    return () => {
      document.removeEventListener("keydown", closeMenu);
      document.removeEventListener("pointerdown", closeMenu);
    };
  }, [accountOpen]);

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
        <strong>{pageName(pathname)}</strong>
      </div>

      <div className="topbar__account-wrap" ref={accountRef}>
        <button
          className="topbar__account"
          type="button"
          onClick={() => setAccountOpen((open) => !open)}
          aria-expanded={accountOpen}
          aria-haspopup="menu"
          aria-controls="account-menu"
        >
          <span className="avatar">{initials(name)}</span>
          <span className="topbar__identity">
            <strong>{name}</strong>
            <small>
              <ShieldCheck size={13} /> {professionalContext}
            </small>
          </span>
          <ChevronDown size={17} aria-hidden="true" />
        </button>
        {accountOpen ? (
          <div className="account-menu" id="account-menu" role="menu">
            <div>
              <strong>{name}</strong>
              <span>{profile?.email || "Conta profissional"}</span>
            </div>
            <button type="button" onClick={logout} role="menuitem">
              <LogOut size={17} /> Encerrar sessão
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
