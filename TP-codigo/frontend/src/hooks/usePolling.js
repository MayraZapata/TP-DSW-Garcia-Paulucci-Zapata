import { useEffect, useRef } from "react";

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
