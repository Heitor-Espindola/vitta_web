import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Syringe,
  ClipboardList,
  CreditCard,
  FileText,
  Settings
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Pacientes", icon: Users, path: "/pacientes" },
  { label: "Vacinas", icon: Syringe, path: "/vacinas" },
  { label: "Aplicações", icon: ClipboardList, path: "/aplicacoes" },
  { label: "Carteiras", icon: CreditCard, path: "/carteiras" },
  { label: "Relatórios", icon: FileText, path: "/relatorios" },
  { label: "Configurações", icon: Settings, path: "/config" }
];

import isotipo from "../assets/isotipo.png";
import isologo from "../assets/isologo.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  return (
    <aside
      className={`relative h-screen bg-slate-900 text-white transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Cabeçalho */}
      <div className="h-20 flex items-center justify-center border-b border-slate-700">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer flex items-center justify-center w-full"
        >
          {collapsed ? (
            <img
              src={isotipo}
              alt="Menu"
              className="w-12 h-12 object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <img
                src={isotipo}
                alt="Menu"
                className="w-12 h-12 object-contain"
              />
              <img
                src={isologo}
                alt="Vitta"
                className="h-16  object-contain"
              />
            </div>
          )}
        </div>
      </div>
      {/* Menu */}
      <nav className="p-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3
                px-3 py-3 rounded-lg mb-2
                transition-all

                ${
                  active
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }
              `}
            >
              <Icon size={20} />

              {!collapsed && (
                <span>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-800 rounded-lg p-3 text-center text-xs">
            <p className="font-bold text-white text-2xl">
              Vitta
            </p>

            <p className="text-slate-400 text-sm">
              Sincronizando saúde com a vida
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
