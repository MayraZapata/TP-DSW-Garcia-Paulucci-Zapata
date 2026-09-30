import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { opciones, titulosSeccion } from "../config/opciones";
import { Icono } from "../components/Iconos";

function saludo(rol, usuario) {
  if (rol === "ADMIN") return "Bienvenido Administrador";
  const nombre = usuario?.nombre ? `${usuario.nombre} ${usuario.apellido || ""}`.trim() : "";
  if (rol === "MEDICO") return `Bienvenido Dr/a. ${nombre}`.trim();
  return `Bienvenido ${nombre}`.trim();
}

export default function Menu() {
  const { rol, usuario } = useAuth();
  const navigate = useNavigate();

  const visibles = opciones.filter((op) => op.roles.includes(rol));
  const secciones = Object.keys(titulosSeccion).filter((s) => visibles.some((op) => op.seccion === s));

  return (
    <div className="menu">
      <h1>{saludo(rol, usuario)}</h1>
      <p className="info-sub">¿Qué querés hacer hoy?</p>

      {secciones.map((s) => (
        <section className="menu-seccion" key={s}>
          {secciones.length > 1 && <h2>{titulosSeccion[s]}</h2>}
          <div className="menu-grid">
            {visibles
              .filter((op) => op.seccion === s)
              .map((op) => (
                <button key={op.label} className="menu-card" onClick={() => navigate(op.path)}>
                  <Icono nombre={op.icono} className="icono" />
                  {op.label}
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}