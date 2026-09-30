import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconoLogo } from "../components/Iconos";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(usuario, password);
      navigate("/menu");
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

function iconoOjo({ cerrado }) {
  return cerrado ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c5 0 9 4 10 7-0.5 1.4-1.5 3-3 4.3M6.6 6.6C4.5 8 3 9.9 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}


  return (
    <div className="login-pagina">
      <Link to="/" className="login-volver">← Volver</Link>
      <div className="login-tarjeta">
        <Link to="/" className="login-logo"><IconoLogo width="26" height="26" /> Gestión de Turnos</Link> 
        <h1>Iniciar sesión</h1>
        <p className="login-sub">Ingresá con tu usuario y contraseña.</p>

        <form onSubmit={handleSubmit} className="form-col">
          {error && <div className="login-error">{error}</div>}
          <input className="campo" type="text" placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
          <div className="campo-clave">
            <input className="campo" type={verPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="ojo" onClick={() => setVerPassword(!verPassword)} aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {iconoOjo({ cerrado: verPassword })}
            </button>
          </div>
          <button type="submit" className="btn btn-block" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="login-extra">
          ¿No tenés cuenta? <Link to="/pacientes?origen=login">Registrate</Link>
          <br />
        </div>
      </div>
    </div>
  );
}