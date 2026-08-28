import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  ChevronLeft,
  ClipboardPlus,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Syringe,
  UsersRound,
  X,
} from "lucide-react";
import isologo from "../assets/isologo.png";
import isotipo from "../assets/isotipo.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Pacientes", icon: UsersRound, path: "/pacientes" },
  { label: "Carteiras", icon: BookOpenCheck, path: "/carteiras" },
  { label: "Aplicações", icon: ClipboardPlus, path: "/aplicacoes" },
  { label: "Vacinas", icon: Syringe, path: "/vacinas" },
  { label: "Relatórios", icon: BarChart3, path: "/relatorios" },
  { label: "Configurações", icon: Settings, path: "/config" },
];

export default function Sidebar({ collapsed, mobileOpen, onCollapse, onClose }) {
  return (
    <>
      {mobileOpen ? (
        <button
          className="sidebar-backdrop"
          onClick={onClose}
          aria-label="Fechar menu"
          type="button"
        />
      ) : null}
      <aside
        className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${
          mobileOpen ? "sidebar--mobile-open" : ""
        }`}
      >
        <div className="sidebar__brand">
          <img className="sidebar__symbol" src={isotipo} alt="" />
          {!collapsed ? (
            <img className="sidebar__wordmark" src={isologo} alt="Vitta" />
          ) : null}
          <button
            className="sidebar__mobile-close"
            onClick={onClose}
            aria-label="Fechar menu"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {!collapsed ? (
          <div className="sidebar__workspace">
            <span>Vitta Profissional</span>
            <small>Atendimento seguro</small>
          </div>
        ) : null}

        <nav className="sidebar__nav" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} aria-hidden="true" />
              {!collapsed ? <span>{label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          {!collapsed ? (
            <div className="sidebar__security">
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <strong>Dados protegidos</strong>
                <span>Acesso conforme o atendimento</span>
              </div>
            </div>
          ) : null}
          <button
            className="sidebar__collapse"
            onClick={onCollapse}
            type="button"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <ChevronLeft size={18} />
            {!collapsed ? <span>Recolher menu</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
