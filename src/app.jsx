import { Navigate, Route, Routes } from "react-router-dom";
import ProfessionalRoute from "./components/ProfessionalRoute";
import AppLayout from "./layout/AppLayout";
import Aplicacoes from "./pages/Aplicacoes";
import Carteiras from "./pages/Carteiras";
import Config from "./pages/Config";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PacienteDetalhe from "./pages/PacienteDetalhe";
import Pacientes from "./pages/Pacientes";
import Relatorios from "./pages/Relatorios";
import Vacinas from "./pages/Vacinas";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProfessionalRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="pacientes/:personId" element={<PacienteDetalhe />} />
          <Route path="carteiras" element={<Carteiras />} />
          <Route path="aplicacoes" element={<Aplicacoes />} />
          <Route path="vacinas" element={<Vacinas />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="config" element={<Config />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
