import { useState, useCallback } from "react";

// Guarda un mensaje (de error o de éxito) para mostrarlo en pantalla con <Mensaje />
export default function useMensaje() {
    const [mensaje, setMensaje] = useState(null);

    const error = useCallback((texto) => setMensaje({ tipo: "error", texto }), []);
    const exito = useCallback((texto) => setMensaje({ tipo: "exito", texto }), []);
    const limpiar = useCallback(() => setMensaje(null), []);

    return { mensaje, error, exito, limpiar };
}