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
import Registro from "./pages/Registro";
import MisDatos from "./pages/MisDatos";
import CambiarPassword from "./pages/CambiarPassword";

import { RUTAS } from "./config/rutas";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={RUTAS.login} element={ <Login /> }/>
          <Route path="/registro" element={ <Registro /> }/>
          <Route element={ <Layout /> }>
            <Route path={RUTAS.home} element={ <Home /> }/>
            <Route path={RUTAS.infoEspecialidades} element={ <Especialidades /> }/>
            <Route path={RUTAS.infoObrasSociales} element={ <ObrasSociales /> }/>
            <Route path={RUTAS.menu} element={ <ProtectedRoute> <Menu /> </ProtectedRoute> }/>
            <Route path={RUTAS.especialidad} element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Especialidad /> </ProtectedRoute> }/>
            <Route path={RUTAS.obraSocial} element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <ObraSocial /> </ProtectedRoute> }/>
            <Route path={RUTAS.diagnostico} element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Diagnostico /> </ProtectedRoute> }/>
            <Route path={RUTAS.tipoUrgencia} element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <TipoUrgencia /> </ProtectedRoute> }/>
            <Route path={RUTAS.medicos} element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Medico /> </ProtectedRoute> }/>
            <Route path="/pacientes" element={ <ProtectedRoute rolesPermitidos={["ADMIN"]}> <Paciente /> </ProtectedRoute> }/>
            <Route path="/mis-datos" element={ <ProtectedRoute rolesPermitidos={["PACIENTE"]}> <MisDatos /> </ProtectedRoute> }/>
            <Route path="/cambiar-password" element={ <ProtectedRoute> <CambiarPassword /> </ProtectedRoute> }/>
            <Route path={RUTAS.turnos} element={ <ProtectedRoute rolesPermitidos={["ADMIN", "PACIENTE"]}> <Turnos /> </ProtectedRoute> }/>
            <Route path={RUTAS.turnosPaciente} element={ <ProtectedRoute rolesPermitidos={["PACIENTE"]}> <TurnosPaciente /> </ProtectedRoute> }/>
            <Route path={RUTAS.historialClinico} element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO", "PACIENTE"]}> <HistorialClinico /> </ProtectedRoute> }/>
            <Route path={RUTAS.agendaMedico} element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO"]}> <AgendaMedico /> </ProtectedRoute> }/>
            <Route path={RUTAS.reporteTurnos} element={ <ProtectedRoute rolesPermitidos={["ADMIN", "MEDICO"]}> <ReporteTurnos /> </ProtectedRoute> }/>
            <Route path="*" element={ <Navigate to={RUTAS.home} replace /> }/>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;