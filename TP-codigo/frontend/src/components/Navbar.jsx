import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IconoLogo, IconoUsuario} from "./Iconos";



export default function Navbar() {
  const { rol, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [confirmarLogout, setConfirmarLogout] = useState(false);
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

  function pedirConfirmacionLogout() {
    setAbierto(false);
    setConfirmarLogout(true);
  }

  async function confirmarYCerrarSesion() {
    setConfirmarLogout(false);
    await logout();
    navigate("/");
  }

  const clase = ({ isActive }) => (isActive ? "activo" : "");

  return (
    <>
      <header className="nav">
        <Link to="/" className="nav-logo"><IconoLogo className="nav-logo-icono" /> Gestión de Turnos</Link>

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
                      <button onClick={() => irA("/mis-datos")}>Cambiar datos</button>
                    )}
                    <button onClick={() => irA("/cambiar-password")}>Cambiar contraseña</button>
                    <hr />
                    <button onClick={pedirConfirmacionLogout}>Cerrar sesión</button>
                  </>
                ) : (
                  <button onClick={() => irA("/login")}>Iniciar sesión</button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {confirmarLogout && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setConfirmarLogout(false)}>&times;</span>
            <h3>¿Cerrar sesión?</h3>
            <p>Vas a salir de tu cuenta. ¿Querés continuar?</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn btn-secundario" onClick={() => setConfirmarLogout(false)}>Cancelar</button>
              <button className="btn btn-peligro" onClick={confirmarYCerrarSesion}>Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}