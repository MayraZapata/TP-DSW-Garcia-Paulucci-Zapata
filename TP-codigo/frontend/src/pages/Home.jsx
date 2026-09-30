import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetchList from "../hooks/useFetchList";
import { unicosPor } from "../utils/unicos";
import { IconoCalendario, IconoFrasco, IconoHospital, IconoCandado } from "../components/Iconos";

export default function Home() {
  const navigate = useNavigate();
  const { rol } = useAuth();
  const especialidades = unicosPor(useFetchList("/especialidades"), "nombreEspecialidad");
  const obras = unicosPor(useFetchList("/obrasSociales"), "nombreObra");

  return (
    <div className="home">
      <section className="hero">
        <h1>Tu salud, a un turno de distancia</h1>
        <p>Reservá tu turno online, consultá tu historial clínico y encontrá al profesional que necesitás, todo en un solo lugar.</p>
        <button className="btn" onClick={() => navigate(rol ? "/menu" : "/login")}>
          {rol ? "Ir a mi menú" : "Ingresar para sacar un turno"}
        </button>
      </section>

      <section className="destacados">
  {rol === "ADMIN" || rol === "PACIENTE" ? (
    <button className="destacado destacado-clicable" onClick={() => navigate("/turnos")}>
      <h3><IconoCalendario /> Turnos online</h3>
      <p>Elegí especialidad, profesional, día y horario, sin llamadas ni filas.</p>
      <span className="enlace">Solicitar turno →</span>
    </button>
  ) : (
    <article className="destacado destacado-bloqueado">
      <h3><IconoCandado /> Turnos online</h3>
      <p>Elegí especialidad, profesional, día y horario, sin llamadas ni filas.</p>
      <span className="info-sub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <IconoCandado width="16" height="16" /> Iniciá sesión para reservar tu turno.
        </span>
    </article>
  )}

  <article className="destacado">
    <h3><IconoFrasco /> {especialidades.length > 0 ? `${especialidades.length} especialidades` : "Especialidades"}</h3>
    <p>Profesionales de distintas áreas para acompañarte.</p>
    <Link to="/info/especialidades" className="enlace">Ver especialidades →</Link>
  </article>
  <article className="destacado">
    <h3><IconoHospital /> {obras.length > 0 ? `${obras.length} obras sociales` : "Obras sociales"}</h3>
    <p>Trabajamos con las principales coberturas de salud.</p>
    <Link to="/info/obras-sociales" className="enlace">Ver obras sociales →</Link>
  </article>
</section>

      {obras.length > 0 && (
        <section className="banner">
          <h2>Conocé las obras sociales con las que trabajamos</h2>
          <div className="chips">
            {obras.slice(0, 6).map((o) => (
              <span key={o.idObra} className="chip">{o.nombreObra}</span>
            ))}
          </div>
          <button className="btn" onClick={() => navigate("/info/obras-sociales")}>Ver más +</button>
        </section>
      )}
    </div>
  );
}