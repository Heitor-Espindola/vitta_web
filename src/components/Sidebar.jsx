import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
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

const primaryNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Pacientes", icon: UsersRound, path: "/pacientes" },
  { label: "Carteiras", icon: BookOpenCheck, path: "/carteiras" },
  { label: "Aplicações", icon: ClipboardPlus, path: "/aplicacoes" },
  { label: "Vacinas", icon: Syringe, path: "/vacinas" },
  { label: "Relatórios", icon: BarChart3, path: "/relatorios" },
];

function NavigationLink({ item, collapsed, onClose }) {
  const { label, icon: Icon, path } = item;
  return (
    <NavLink
      to={path}
      end={path === "/"}
      onClick={onClose}
      className={({ isActive }) =>
        `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
      }
      aria-label={collapsed ? label : undefined}
      data-tooltip={label}
    >
      <Icon size={19} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

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
          <img className="sidebar__symbol" src={isotipo} alt="Vitta" />
          <div className="sidebar__brand-copy">
            <img className="sidebar__wordmark" src={isologo} alt="Vitta" />
            <span>Portal Profissional</span>
          </div>
          <button
            className="sidebar__collapse"
            onClick={onCollapse}
            type="button"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <button
            className="sidebar__mobile-close"
            onClick={onClose}
            aria-label="Fechar menu"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          {primaryNavItems.map((item) => (
            <NavigationLink
              key={item.path}
              item={item}
              collapsed={collapsed}
              onClose={onClose}
            />
          ))}
        </nav>

        <div className="sidebar__footer">
          <NavigationLink
            item={{ label: "Configurações", icon: Settings, path: "/config" }}
            collapsed={collapsed}
            onClose={onClose}
          />
          <div className="sidebar__security-line" aria-label="Conexão protegida">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Ambiente protegido</span>
          </div>
        </div>
      </aside>
    </>
  );
}
