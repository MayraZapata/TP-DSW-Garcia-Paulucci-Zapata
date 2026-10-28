// Prioridades de una urgencia. La decide una PERSONA al ingresar al paciente
// (no se deduce del tipo de urgencia: puede llegar un corte leve o algo gravísimo).
// El orden de la lista es el orden de atención: rojo primero.
export const PRIORIDADES = [
  { valor: "rojo", etiqueta: "Rojo", detalle: "Atención inmediata" },
  { valor: "amarillo", etiqueta: "Amarillo", detalle: "Prioridad intermedia" },
  { valor: "verde", etiqueta: "Verde", detalle: "Puede esperar" },
];

// Cómo se muestran los estados de una urgencia (en la base se guardan sin tildes ni espacios)
export const ESTADOS_URGENCIA = {
  en_espera: "En espera",
  en_atencion: "En atención",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};
