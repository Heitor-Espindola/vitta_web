import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`
          min-h-screen
          bg-gray-50
          p-6
          transition-all
          duration-300
          ${collapsed ? "ml-20" : "ml-64"}
        `}
      >
        <Outlet />
      </main>
    </div>
  );
}