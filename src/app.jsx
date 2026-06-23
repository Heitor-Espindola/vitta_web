// #imports
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { useState } from "react";

//Import das telas
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Vacinas from "./pages/Vacinas";
import Aplicacoes from "./pages/Aplicacoes";
import Carteiras from "./pages/Carteiras";
import Relatorios from "./pages/Relatorios";
import Config from "./pages/Config";


//function App() {
//  const [collapsed, setCollapsed] = useState(false);
//
//  return (
//    <div className="flex">
//      <Sidebar
//        collapsed={collapsed}
//        setCollapsed={setCollapsed}
//      />
//
//      <main className="flex-1 p-6">
//        Conteúdo
//      </main>
//    </div>
//  );
//}

function App() {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className="flex-1 p-6">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/pacientes"
            element={<Pacientes />}
          />

          <Route
            path="/vacinas"
            element={<Vacinas />}
          />

          <Route
            path="/aplicacoes"
            element={<Aplicacoes />}
          />

          <Route
            path="/carteiras"
            element={<Carteiras />}
          />

          <Route
            path="/relatorios"
            element={<Relatorios />}
          />

          <Route
            path="/config"
            element={<Config />}
          />

        </Routes>

      </main>

    </div>
  );
}

export default App;