import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="login-pagina">
      <Link to="/" className="login-volver">← Volver</Link>
      <div className="login-tarjeta">
        <Link to="/" className="login-logo">🩺 Gestión de Turnos</Link>
        <h1>Iniciar sesión</h1>
        <p className="login-sub">Ingresá con tu usuario y contraseña.</p>

        <form onSubmit={handleSubmit} className="form-col">
          {error && <div className="login-error">{error}</div>}
          <input className="campo" type="text" placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
          <div className="campo-clave">
            <input className="campo" type={verPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="ojo" onClick={() => setVerPassword(!verPassword)} aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {verPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button type="submit" className="btn btn-block" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="login-extra">
          ¿No tenés cuenta? <Link to="/pacientes?origen=login">Registrate</Link>
          <br />
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}