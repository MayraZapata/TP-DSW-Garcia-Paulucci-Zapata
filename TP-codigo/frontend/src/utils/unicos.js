export function unicosPor(lista, campo) {
  const vistos = new Set();
  return lista.filter((item) => {
    const clave = (item[campo] || "").trim().toLowerCase();
    if (!clave || vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}