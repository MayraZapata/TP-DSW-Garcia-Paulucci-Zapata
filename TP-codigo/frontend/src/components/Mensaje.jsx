import { useEffect, useRef } from "react";

export default function Mensaje({ mensaje }) {
    const ref = useRef(null);


    useEffect(() => {
        if (mensaje) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [mensaje]);

    if (!mensaje) return null;

    return (
        <div ref={ref} className={`mensaje mensaje-${mensaje.tipo}`} role="alert">
            {mensaje.texto}
        </div>
    );
}