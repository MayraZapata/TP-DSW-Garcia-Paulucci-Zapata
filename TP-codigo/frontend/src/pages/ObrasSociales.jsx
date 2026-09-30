import useFetchList from "../hooks/useFetchList";
import { unicosPor } from "../utils/unicos";
import { IconoHospital } from "../components/Iconos";


export default function ObrasSociales() {
  const obras = unicosPor(useFetchList("/obrasSociales"), "nombreObra");

  return (
    <div className="info">
      <h1>Obras sociales</h1>
      <p className="info-sub">Estas son las coberturas con las que trabajamos.</p>

      {obras.length === 0 ? (
        <p className="info-sub">No hay obras sociales para mostrar por el momento.</p>
      ) : (
        <div className="tarjetas">
          {obras.map((o) => (
            <article key={o.idObra} className="tarjeta">
              <h3><IconoHospital /> {o.nombreObra}</h3>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}