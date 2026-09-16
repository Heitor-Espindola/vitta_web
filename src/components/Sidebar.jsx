import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  ChevronRight,
  ClipboardPlus,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Syringe,
  UserCog,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import isologo from "../assets/isologo.png";
import isotipo from "../assets/isotipo.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Pacientes", icon: UsersRound, path: "/pacientes" },
  { label: "Vacinas", icon: Syringe, path: "/vacinas" },
  { label: "Aplicações", icon: ClipboardPlus, path: "/aplicacoes" },
  { label: "Agendamentos", icon: CalendarClock, path: "/agendamentos" },
  { label: "Carteiras", icon: BookOpenCheck, path: "/carteiras" },
  { label: "Relatórios", icon: BarChart3, path: "/relatorios" },
  { label: "Equipe e UBS", icon: UserCog, path: "/funcionarios" },
  { label: "Configurações", icon: Settings, path: "/config" },
];

export default function Sidebar({ collapsed, mobileOpen, onCollapse, onClose }) {
  const { isAdmin } = useAuth();

  return (
    <>
      {mobileOpen ? (
        <button className="sidebar-backdrop" onClick={onClose} aria-label="Fechar menu" type="button" />
      ) : null}
      <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${mobileOpen ? "sidebar--mobile-open" : ""}`}>
        <div className="sidebar__brand">
          <button
            className="sidebar__brand-toggle"
            onClick={onCollapse}
            type="button"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            <span className="sidebar__brand-symbol-wrap">
              <img className="sidebar__symbol" src={isotipo} alt="Vitta" />
              <span className="sidebar__brand-arrow"><ChevronRight size={18} /></span>
            </span>
          </button>
          {!collapsed ? <img className="sidebar__wordmark" src={isologo} alt="Vitta" /> : null}
          <button className="sidebar__mobile-close" onClick={onClose} aria-label="Fechar menu" type="button">
            <X size={20} />
          </button>
        </div>

        {!collapsed ? (
          <div className="sidebar__workspace">
            <span>Vitta Profissional</span>
            <small>{isAdmin ? "Gestão autorizada" : "Atendimento seguro"}</small>
          </div>
        ) : null}

        <nav className="sidebar__nav" aria-label="Navegação principal">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`}
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
        </div>
      </aside>
    </>
  );
}
