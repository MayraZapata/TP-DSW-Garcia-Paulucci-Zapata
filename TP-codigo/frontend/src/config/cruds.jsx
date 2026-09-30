export const crudEspecialidad = {
  endpoint: "/especialidades",
  idField: "idEspecialidad",
  titulo: "Gestión de Especialidades",
  tituloNuevo: "Nueva especialidad",
  tituloEditar: "Editar especialidad",
  placeholderBusqueda: "Buscar por nombre o descripción...",
  mensajeVacio: "No hay especialidades para mostrar.",
  mensajeConfirmarEliminar: "¿Estás seguro de eliminar esta especialidad?",
  campos: [
    { name: "nombreEspecialidad", placeholder: "Nombre de la Especialidad" },
    { name: "descripcion", placeholder: "Descripción (opcional)" },
  ],
  filtrarPor: (e, t) => e.nombreEspecialidad?.toLowerCase().includes(t) || e.descripcion?.toLowerCase().includes(t),
  renderItem: (e) => (
    <>
      <strong>{e.nombreEspecialidad}</strong>
      {e.descripcion && <p style={{ margin: "6px 0 0" }}>{e.descripcion}</p>}
    </>
  ),
};

export const crudObraSocial = {
  endpoint: "/obrasSociales",
  idField: "idObra",
  titulo: "Gestión de Obras Sociales",
  tituloNuevo: "Nueva obra social",
  tituloEditar: "Editar obra social",
  placeholderBusqueda: "Buscar por nombre...",
  mensajeVacio: "No hay obras sociales para mostrar.",
  mensajeConfirmarEliminar: "¿Estás seguro de eliminar esta obra social?",
  campos: [
    { name: "nombreObra", placeholder: "Nombre de la Obra Social" },
    { name: "monto", placeholder: "Monto", type: "number", step: "0.01", min: "0", toEnvio: Number },
  ],
  filtrarPor: (o, t) => o.nombreObra?.toLowerCase().includes(t),
  renderItem: (o) => (
    <>
      <strong>{o.nombreObra}</strong>
      <p style={{ margin: "6px 0 0" }}>Monto: ${o.monto}</p>
    </>
  ),
};

export const crudDiagnostico = {
  endpoint: "/diagnosticos",
  idField: "idDiagnostico",
  titulo: "Gestión de Diagnósticos",
  tituloNuevo: "Nuevo diagnóstico",
  tituloEditar: "Editar diagnóstico",
  placeholderBusqueda: "Buscar por nombre o tratamiento...",
  mensajeVacio: "No hay diagnósticos para mostrar.",
  mensajeConfirmarEliminar: "¿Estás seguro de eliminar este diagnóstico?",
  campos: [
    { name: "nombreDiagnostico", placeholder: "Nombre del Diagnóstico" },
    { name: "tratamiento", placeholder: "Tratamiento (opcional)" },
  ],
  filtrarPor: (d, t) => d.nombreDiagnostico?.toLowerCase().includes(t) || d.tratamiento?.toLowerCase().includes(t),
  renderItem: (d) => (
    <>
      <strong>{d.nombreDiagnostico}</strong>
      {d.tratamiento && <p style={{ margin: "6px 0 0" }}>{d.tratamiento}</p>}
    </>
  ),
};

export const crudTipoUrgencia = {
  endpoint: "/tiposUrgencia",
  idField: "idTipo",
  titulo: "Gestión de Tipos de Urgencia",
  tituloNuevo: "Nuevo tipo de urgencia",
  tituloEditar: "Editar tipo de urgencia",
  placeholderBusqueda: "Buscar por nombre o descripción...",
  mensajeVacio: "No hay tipos de urgencia para mostrar.",
  mensajeConfirmarEliminar: "¿Estás seguro de eliminar este tipo de urgencia?",
  campos: [
    { name: "nombre", placeholder: "Nombre del Tipo de Urgencia" },
    { name: "descripcionTipo", placeholder: "Descripción (opcional)" },
  ],
  filtrarPor: (t, term) => t.nombre?.toLowerCase().includes(term) || t.descripcionTipo?.toLowerCase().includes(term),
  renderItem: (t) => (
    <>
      <strong>{t.nombre}</strong>
      {t.descripcionTipo && <p style={{ margin: "6px 0 0" }}>{t.descripcionTipo}</p>}
    </>
  ),
};