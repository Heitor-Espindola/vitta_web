import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layout/AppLayout";

// Import das telas
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Vacinas from "./pages/Vacinas";
import Aplicacoes from "./pages/Aplicacoes";
import Carteiras from "./pages/Carteiras";
import Relatorios from "./pages/Relatorios";
import Config from "./pages/Config";


function App() {
  return (
    <Routes>
      <Route path="/"element={<Login />}/>
      <Route element={ <ProtectedRoute> <AppLayout /> </ProtectedRoute> } >
        <Route path="/home" element={<Dashboard />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/vacinas" element={<Vacinas />} />
        <Route path="/aplicacoes" element={<Aplicacoes />} />
        <Route path="/carteiras" element={<Carteiras />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/config" element={<Config />} />
      </Route>
    </Routes>
  );
}


export default App;