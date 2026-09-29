import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function IconoUsuario() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#2B1B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

export default function Navbar() {
  const { rol, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const usuarioRef = useRef(null);

  useEffect(() => {
    function cerrarSiClickAfuera(e) {
      if (usuarioRef.current && !usuarioRef.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", cerrarSiClickAfuera);
    return () => document.removeEventListener("mousedown", cerrarSiClickAfuera);
  }, []);

  function irA(ruta) {
    setAbierto(false);
    navigate(ruta);
  }

  function handleLogout() {
    setAbierto(false);
    logout();
    navigate("/");
  }

  const clase = ({ isActive }) => (isActive ? "activo" : "");

  return (
    <header className="nav">
      <Link to="/" className="nav-logo">🩺 Gestión de Turnos</Link>

      <div className="nav-derecha">
        <nav className="nav-links">
          {rol && <NavLink to="/menu" className={clase}>Menú</NavLink>}
          <NavLink to="/info/especialidades" className={clase}>Especialidades</NavLink>
          <NavLink to="/info/obras-sociales" className={clase}>Obras sociales</NavLink>
        </nav>

        <div className="nav-usuario" ref={usuarioRef}>
          <button className="nav-avatar" onClick={() => setAbierto(!abierto)} aria-label="Menú de usuario">
            <IconoUsuario />
          </button>

          {abierto && (
            <div className="nav-menu">
              {rol ? (
                <>
                  {rol === "PACIENTE" && (
                    <>
                      <button onClick={() => irA("/pacientes")}>Cambiar datos</button>
                      <hr />
                    </>
                  )}
                  <button onClick={handleLogout}>Cerrar sesión</button>
                </>
              ) : (
                <button onClick={() => irA("/login")}>Iniciar sesión</button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}