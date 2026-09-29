export const opciones = [
  { label: "Solicitar Turnos", path: "/turnos", icono: "📅", seccion: "atencion", roles: ["ADMIN", "PACIENTE"] },
  { label: "Mis Turnos", path: "/turnos-paciente", icono: "🗓️", seccion: "atencion", roles: ["PACIENTE"] },
  { label: "Agenda de Turnos", path: "/agenda-medico", icono: "📋", seccion: "atencion", roles: ["ADMIN", "MEDICO"] },
  { label: "Consultar Reportes", path: "/reporte-turnos", icono: "📊", seccion: "atencion", roles: ["ADMIN", "MEDICO"] },
  { label: "Historial Clínico", path: "/historial-clinico", icono: "🩺", seccion: "atencion", roles: ["ADMIN", "MEDICO", "PACIENTE"] },
  { label: "Gestión de Pacientes", path: "/pacientes", icono: "🧑", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Médicos", path: "/medicos", icono: "👨‍⚕️", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Diagnósticos", path: "/diagnostico", icono: "🧾", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Obras Sociales", path: "/obra-social", icono: "🏥", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Especialidades", path: "/especialidad", icono: "🔬", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Tipos de Urgencia", path: "/tipo-urgencia", icono: "🚑", seccion: "gestion", roles: ["ADMIN"] },
];

export const titulosSeccion = {
  atencion: "Atención",
  gestion: "Gestión",
};