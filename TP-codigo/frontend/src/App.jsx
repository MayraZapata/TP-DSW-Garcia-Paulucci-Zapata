import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Especialidades from "./pages/Especialidades";
import ObrasSociales from "./pages/ObrasSociales";
import Especialidad from "./pages/Especialidad";
import ObraSocial from "./pages/ObraSocial";
import Diagnostico from "./pages/Diagnostico";
import TipoUrgencia from "./pages/TipoUrgencia";
import Medico from "./pages/Medico";
import Paciente from "./pages/Paciente";
import Turnos from "./pages/Turnos";
import TurnosPaciente from "./pages/TurnosPaciente";
import HistorialClinico from "./pages/HistorialClinico";
import AgendaMedico from "./pages/AgendaMedico";
import ReporteTurnos from "./pages/ReporteTurnos";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={ <Login /> }/>
          <Route element={ <Layout /> }>
            <Route path="/" element={ <Home /> }/>
            <Route path="/info/especialidades" element={ <Especialidades /> }/>
            <Route path="/info/obras-sociales" element={ <ObrasSociales /> }/>
            <Route path="/menu" element={ <ProtectedRoute> <Menu /> </ProtectedRoute> }/>
            <Route path="/especialidad" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Especialidad /> </ProtectedRoute> }/>
            <Route path="/obra-social" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <ObraSocial /> </ProtectedRoute> }/>
            <Route path="/diagnostico" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Diagnostico /> </ProtectedRoute> }/>
            <Route path="/tipo-urgencia" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <TipoUrgencia /> </ProtectedRoute> }/>
            <Route path="/medicos" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Medico /> </ProtectedRoute> }/>
            <Route path="/pacientes" element={ <Paciente /> }/>
            <Route path="/turnos" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "PACIENTE"]}> <Turnos /> </ProtectedRoute> }/>
            <Route path="/turnos-paciente" element={ <ProtectedRoute rolesPermitidos={["PACIENTE"]}> <TurnosPaciente /> </ProtectedRoute> }/>
            <Route path="/historial-clinico" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO", "PACIENTE"]}> <HistorialClinico /> </ProtectedRoute> }/>
            <Route path="/agenda-medico" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO"]}> <AgendaMedico /> </ProtectedRoute> }/>
            <Route path="/reporte-turnos" element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO"]}> <ReporteTurnos /> </ProtectedRoute> }/>
            <Route path="*" element={ <Navigate to="/" replace /> }/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;