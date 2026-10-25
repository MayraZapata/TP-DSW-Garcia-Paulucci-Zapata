// Ayudas para los tipos de urgencia (las usan el formulario de ingreso y el buscador de tipos).

// El tipo de urgencia "Otro" permite agregar una descripción breve y opcional.
// Se reconoce por el nombre (el backend aplica la misma regla y solo guarda la descripción si el tipo es "Otro").
export const esTipoOtro = (tipo) => tipo?.nombre?.trim().toLowerCase() === "otro";

// Para comparar textos al buscar: sin tildes ni mayúsculas ("Fiebre" encuentra "fiébre")
export const normalizarTexto = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
