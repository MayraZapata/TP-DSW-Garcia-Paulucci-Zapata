import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Especialidad from "./pages/Especialidad";
import ObraSocial from "./pages/ObraSocial";
import Diagnostico from "./pages/Diagnostico";
import Medico from "./pages/Medico";
import Paciente from "./pages/Paciente";
import TipoUrgencia from "./pages/TipoUrgencia";
import Turnos from "./pages/Turnos";
import HistorialClinico from "./pages/HistorialClinico";
import AgendaMedico from "./pages/AgendaMedico";
import ReporteTurnos from "./pages/ReporteTurnos";
import TurnosPaciente from "./pages/TurnosPaciente";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/menu" element={ <ProtectedRoute> <Menu /> </ProtectedRoute> } />
          <Route path="/especialidad" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Especialidad /> </ProtectedRoute> }/>
          <Route path="/obra-social" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <ObraSocial /> </ProtectedRoute> }/>
          <Route path="/diagnostico" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Diagnostico /> </ProtectedRoute> }/>
          <Route path="/medicos" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Medico /> </ProtectedRoute> }/>
          <Route path="/pacientes" element={ <Paciente /> }/>
          <Route path="/tipo-urgencia" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <TipoUrgencia /> </ProtectedRoute> }/>
          <Route path="/turnos" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "PACIENTE"]}> <Turnos /> </ProtectedRoute> }/>
          <Route path="/historial-clinico" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO", "PACIENTE"]}> <HistorialClinico /> </ProtectedRoute> }/>
          <Route path="/agenda-medico" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO"]}> <AgendaMedico /> </ProtectedRoute> }/>
          <Route path="/reporte-turnos" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO"]}> <ReporteTurnos /> </ProtectedRoute> }/>
          <Route path="/turnos-paciente" element={ <ProtectedRoute rolesPermitidos={["PACIENTE"]}> <TurnosPaciente /> </ProtectedRoute> }/>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;