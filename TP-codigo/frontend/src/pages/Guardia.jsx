import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import usePolling from "../hooks/usePolling";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "../components/Mensaje";
import PrioridadChip from "../components/PrioridadChip";
import IngresoUrgenciaForm from "../components/IngresoUrgenciaForm";
import FinalizarUrgenciaModal from "../components/FinalizarUrgenciaModal";
import { PRIORIDADES } from "../config/prioridades";


const CADA_CUANTO_ACTUALIZAR = 5000;

// "14:32:05" -> "14:32"
const horaCorta = (hora) => (hora || "").slice(0, 5);

// "hace 12 min" a partir de la fecha y hora de llegada (que pone el servidor)
function haceCuanto(fechaAtencion, horaAtencion, ahora) {
  const fecha = (fechaAtencion || "").split("T")[0];
  const minutos = Math.max(0, Math.floor((ahora - new Date(`${fecha}T${horaAtencion}`)) / 60000));
  if (Number.isNaN(minutos) || minutos < 1) return "recién llegó";
  if (minutos < 60) return `hace ${minutos} min`;
  return `hace ${Math.floor(minutos / 60)} h ${minutos % 60} min`;
}


export default function Guardia() {
  const { rol, usuario } = useAuth();
  const aviso = useMensaje();

  const [urgencias, setUrgencias] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [sinConexion, setSinConexion] = useState(false);
  const [enEdicion, setEnEdicion] = useState(null);
  const [aFinalizar, setAFinalizar] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const data = await api.get("/urgencias/guardia");
      setUrgencias(data);
      setUltimaActualizacion(new Date());
      setSinConexion(false);
    } catch {
      // Si falla una consulta se deja la última lista a la vista y se avisa; en la próxima vuelta se reintenta
      setSinConexion(true);
    }
  }, []);

  usePolling(cargar, CADA_CUANTO_ACTUALIZAR);

  const enEspera = urgencias.filter((u) => u.estado === "en_espera");
  const enAtencion = urgencias.filter((u) => u.estado === "en_atencion");

  async function accion(promesa, textoExito) {
    aviso.limpiar();
    try {
      const r = await promesa;
      aviso.exito(textoExito ?? r?.message ?? "Listo");
    } catch (error) {
      aviso.error(error.message);
    }
    cargar();
  }

  const atender = (u) => accion(api.patch(`/urgencias/${u.idAtencion}/atender`, {}));

  function cancelar(u) {
    if (!confirm(`¿Cancelar la urgencia de ${u.paciente.nombre} ${u.paciente.apellido}?`)) return;
    accion(api.patch(`/urgencias/${u.idAtencion}/cancelar`, {}));
  }

  function alGuardarFormulario(mensaje) {
    setEnEdicion(null);
    aviso.exito(mensaje);
    cargar();
  }

  function alFinalizar(mensaje) {
    setAFinalizar(null);
    aviso.exito(mensaje);
    cargar();
  }

  const esMia = (u) => u.medico?.matricula === usuario?.matricula;

  function renderUrgencia(u, indice) {
    const esElPrimero = u.estado === "en_espera" && indice === 0;
    return (
      <div className={`item-card urgencia-card prioridad-${u.prioridad}`} key={u.idAtencion}>
        <div className="urgencia-cabecera">
          {u.estado === "en_espera" && <span className="urgencia-posicion" title="Lugar en la lista de espera">{indice + 1}.º</span>}
          <PrioridadChip prioridad={u.prioridad} />
          <strong>{u.paciente.nombre} {u.paciente.apellido}</strong>
        </div>

        <p className="urgencia-detalle">
          <strong>{u.tipoUrgencia?.nombre}</strong>{u.detalleTipo ? ` (${u.detalleTipo})` : ""} — {u.motivo}
          <br />
          DNI {u.paciente.dni} · {u.paciente.obraSocial?.nombreObra ?? "Sin obra social"}
          <br />
          Llegó a las {horaCorta(u.horaAtencion)} ({haceCuanto(u.fechaAtencion, u.horaAtencion, ultimaActualizacion)})
          {u.estado === "en_atencion" && u.medico && (
            <>
              <br />
              <strong>Lo atiende Dr/a. {u.medico.nombre} {u.medico.apellido}</strong>
            </>
          )}
        </p>

        <div className="item-card-acciones">
          {rol === "ADMIN" && u.estado === "en_espera" && (
            <button className="btn btn-secundario" onClick={() => setEnEdicion(u)}>Editar</button>
          )}
          {rol === "ADMIN" && (
            <button className="btn btn-peligro" onClick={() => cancelar(u)}>Cancelar</button>
          )}

          {rol === "MEDICO" && u.estado === "en_espera" && (
            <button
              className="btn"
              disabled={!esElPrimero}
              title={esElPrimero ? "Tomar a este paciente" : "Solo se puede atender al primero de la lista"}
              onClick={() => atender(u)}
            >
              Atender
            </button>
          )}
          {rol === "MEDICO" && u.estado === "en_atencion" && esMia(u) && (
            <>
              <button className="btn" onClick={() => setAFinalizar(u)}>Finalizar</button>
              <button className="btn btn-peligro" onClick={() => cancelar(u)}>Cancelar</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const cantidadPorPrioridad = (valor) => enEspera.filter((u) => u.prioridad === valor).length;

  return (
    <div className="gestion">
      <div className="gestion-header">
        <h1>Guardia / Urgencias</h1>
        <p className="info-sub">
          La lista se actualiza sola cada {CADA_CUANTO_ACTUALIZAR / 1000} segundos
          {" "}(última actualización: {ultimaActualizacion.toLocaleTimeString("es-AR", { hour12: false })}).
        </p>
      </div>

      <Mensaje mensaje={aviso.mensaje} />
      {sinConexion && <div className="mensaje mensaje-error">No se pudo actualizar la lista. Se muestra la última que llegó y se reintenta sola.</div>}

      <div className={rol === "ADMIN" ? "gestion-cuerpo" : "gestion-cuerpo guardia-solo-lista"}>
        {rol === "ADMIN" && (
          <IngresoUrgenciaForm
            key={enEdicion?.idAtencion ?? "nuevo"}
            urgencia={enEdicion}
            onGuardado={alGuardarFormulario}
            onCancelarEdicion={() => setEnEdicion(null)}
          />
        )}

        <div className="gestion-lista">
          <div className="guardia-resumen">
            {PRIORIDADES.map((p) => (
              <span key={p.valor} className={`prioridad-chip prioridad-${p.valor}`} title={p.detalle}>
                {p.etiqueta}: {cantidadPorPrioridad(p.valor)}
              </span>
            ))}
          </div>

          <div className="gestion-lista-items">
            <h2 className="guardia-subtitulo">Lista de espera ({enEspera.length})</h2>
            {enEspera.length === 0 ? (
              <p className="info-sub">No hay pacientes esperando.</p>
            ) : (
              enEspera.map((u, i) => renderUrgencia(u, i))
            )}

            <h2 className="guardia-subtitulo">En atención ({enAtencion.length})</h2>
            {enAtencion.length === 0 ? (
              <p className="info-sub">No hay pacientes en atención.</p>
            ) : (
              enAtencion.map((u, i) => renderUrgencia(u, i))
            )}
          </div>
        </div>
      </div>

      {aFinalizar && (
        <FinalizarUrgenciaModal urgencia={aFinalizar} onCerrar={() => setAFinalizar(null)} onFinalizada={alFinalizar} />
      )}
    </div>
  );
}
