import { useEffect, useRef } from "react";

// Ejecuta `funcion` apenas se monta y después cada `ms` milisegundos, para que una pantalla
// se actualice sola (por ejemplo la lista de espera de la guardia).
// - Solo consulta mientras la pestaña está visible, y consulta enseguida al volver a ella.
// - Guarda la última versión de `funcion` en una ref: cambiar la función no reinicia el temporizador.
export default function usePolling(funcion, ms) {
  const ultimaFuncion = useRef(funcion);

  useEffect(() => {
    ultimaFuncion.current = funcion;
  });

  useEffect(() => {
    const ejecutarSiEsVisible = () => {
      if (document.visibilityState === "visible") ultimaFuncion.current();
    };

    ultimaFuncion.current();
    const id = setInterval(ejecutarSiEsVisible, ms);
    document.addEventListener("visibilitychange", ejecutarSiEsVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", ejecutarSiEsVisible);
    };
  }, [ms]);
}
