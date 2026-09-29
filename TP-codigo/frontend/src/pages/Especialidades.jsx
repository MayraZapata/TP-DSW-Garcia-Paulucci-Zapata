import useFetchList from "../hooks/useFetchList";
import { unicosPor } from "../utils/unicos";

export default function Especialidades() {
  const especialidades = unicosPor(useFetchList("/especialidades"), "nombreEspecialidad");

  return (
    <div className="info">
      <h1>Nuestras especialidades</h1>
      <p className="info-sub">Contamos con profesionales de distintas áreas para acompañarte.</p>

      {especialidades.length === 0 ? (
        <p className="info-sub">No hay especialidades para mostrar por el momento.</p>
      ) : (
        <div className="tarjetas">
          {especialidades.map((e) => (
            <article key={e.idEspecialidad} className="tarjeta">
              <h3>{e.nombreEspecialidad}</h3>
              <p>{e.descripcion || "Consultá la disponibilidad al solicitar tu turno."}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}