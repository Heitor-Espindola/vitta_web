import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "src/components/Sidebar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
      <main className="flex-1 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}