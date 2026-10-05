import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RUTAS } from "../config/rutas";

export default function ProtectedRoute({ children, rolesPermitidos }) {
  const { rol, cargando } = useAuth();

  // Mientras se consulta /login/me no sabemos si hay sesión: esperamos
  if (cargando) return null;

  if (!rol) {
    return <Navigate to={RUTAS.login} replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to={RUTAS.menu} replace />;
  }

  return children;
}