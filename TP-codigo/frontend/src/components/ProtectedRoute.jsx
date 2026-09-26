import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, rolesPermitidos }) {
    const { rol } = useAuth();

    if (!rol) {
        return <Navigate to="/login" replace />;
    }

    if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
        return <Navigate to="/menu" replace />;
    }

    return children;
}