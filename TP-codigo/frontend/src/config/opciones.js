export const opciones = [
  { label: "Solicitar Turnos", path: "/turnos", icono: "calendario", seccion: "atencion", roles: ["ADMIN", "PACIENTE"] },
  { label: "Mis Turnos", path: "/turnos-paciente", icono: "calendarioCheck", seccion: "atencion", roles: ["PACIENTE"] },
  { label: "Agenda de Turnos", path: "/agenda-medico", icono: "portapapeles", seccion: "atencion", roles: ["ADMIN", "MEDICO"] },
  { label: "Consultar Reportes", path: "/reporte-turnos", icono: "grafico", seccion: "atencion", roles: ["ADMIN", "MEDICO"] },
  { label: "Turnos por Paciente", path: "/listado-pacientes", icono: "calendarioCheck", seccion: "atencion", roles: ["ADMIN"] },
  { label: "Historial Clínico", path: "/historial-clinico", icono: "historial", seccion: "atencion", roles: ["ADMIN", "MEDICO", "PACIENTE"] },
  { label: "Gestión de Pacientes", path: "/pacientes", icono: "persona", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Médicos", path: "/medicos", icono: "medico", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Diagnósticos", path: "/diagnostico", icono: "receta", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Obras Sociales", path: "/obra-social", icono: "hospital", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Especialidades", path: "/especialidad", icono: "frasco", seccion: "gestion", roles: ["ADMIN"] },
  { label: "Gestión de Tipos de Urgencia", path: "/tipo-urgencia", icono: "urgencia", seccion: "gestion", roles: ["ADMIN"] },
];

export const titulosSeccion = {
  atencion: "Atención",
  gestion: "Gestión",
};