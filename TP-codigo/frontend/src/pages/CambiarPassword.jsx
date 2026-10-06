import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "../components/Mensaje";

export default function CambiarPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const aviso = useMensaje();
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    aviso.limpiar();
    if (passwordNueva !== repetir) {
      aviso.error("Las contraseñas nuevas no coinciden");
      return;
    }
    setCargando(true);
    try {
      await api.post("/login/cambiar-password", { passwordActual, passwordNueva });
      // Si llegó navegando dentro de la app, vuelve a la pantalla anterior.
      // Si entró directo por la URL ("default"), -1 lo sacaría del sitio: va al menú.
      if (location.key !== "default") navigate(-1);
      else navigate("/menu");
    } catch (error) {
      aviso.error(error.message);
      setCargando(false);
    }
  }

  return (
    <div className="gestion gestion-solo">
      <div className="gestion-header"><h1>Cambiar contraseña</h1></div>
      <Mensaje mensaje={aviso.mensaje} />
      <form className="gestion-form" onSubmit={handleSubmit}>
        <input className="campo" type="password" placeholder="Contraseña actual" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} />
        <input className="campo" type="password" placeholder="Contraseña nueva (mínimo 6 caracteres)" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} />
        <input className="campo" type="password" placeholder="Repetir contraseña nueva" value={repetir} onChange={(e) => setRepetir(e.target.value)} />
        <button type="submit" className="btn" disabled={cargando}>
          {cargando ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}