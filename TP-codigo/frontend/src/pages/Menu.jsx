import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const opciones = [
    { label: "CRUD Pacientes", path: "/pacientes", roles: ["ADMIN"] },
    { label: "Cambiar datos", path: "/pacientes", roles: ["PACIENTE"] },
    { label: "CRUD Médicos", path: "/medicos", roles: ["ADMIN"] },
    { label: "CRUD Obras Sociales", path: "/obra-social", roles: ["ADMIN"] },
    { label: "CRUD Especialidades", path: "/especialidad", roles: ["ADMIN"] },
    { label: "CRUD Diagnósticos", path: "/diagnostico", roles: ["ADMIN"] },
    { label: "CRUD Tipos de Urgencia", path: "/tipo-urgencia", roles: ["ADMIN"] },
    { label: "Solicitar Turno", path: "/turnos", roles: ["ADMIN", "PACIENTE"] },
    { label: "Mis Turnos / Cancelar", path: "/turnos-paciente", roles: ["PACIENTE"] },
    { label: "Historial Clínico", path: "/historial-clinico", roles: ["ADMIN", "MEDICO", "PACIENTE"] },
    { label: "Agenda de Turnos", path: "/agenda-medico", roles: ["ADMIN", "MEDICO"] },
    { label: "Consultar / Reporte de Turnos", path: "/reporte-turnos", roles: ["ADMIN", "MEDICO"] },
];

const nombresRol = {
    ADMIN: "Administrador",
    MEDICO: "Médico",
    PACIENTE: "Paciente",
};

export default function Menu() {
    const { rol, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="contenedor">
            <h1>Menú de Opciones</h1>
            <h2>{nombresRol[rol] || rol}</h2>

            {opciones
            .filter((op) => op.roles.includes(rol))
            .map((op) => (
                <button key={op.label} onClick={() => navigate(op.path)}>
                {op.label}
                </button>
            ))}

            <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
    );
}