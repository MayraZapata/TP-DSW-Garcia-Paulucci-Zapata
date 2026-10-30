
export const esTipoOtro = (tipo) => tipo?.nombre?.trim().toLowerCase() === "otro";

// Para comparar textos al buscar: sin tildes ni mayúsculas ("Fiebre" encuentra "fiébre")
export const normalizarTexto = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
