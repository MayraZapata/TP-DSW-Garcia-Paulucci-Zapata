import { useState } from "react";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "./Mensaje";
import PrioridadChip from "./PrioridadChip";

// Ventana del MÉDICO para finalizar una urgencia: hay que dejar un diagnóstico.
// Se puede elegir uno ya cargado o cargar uno NUEVO en el momento (queda guardado para otras atenciones;
// el nombre no se puede repetir: si ya existe, el sistema avisa y se elige de la lista).
export default function FinalizarUrgenciaModal({ urgencia, onCerrar, onFinalizada }) {
  const diagnosticos = useFetchList("/diagnosticos");
  const aviso = useMensaje();

  const [modo, setModo] = useState("existente");   // "existente" | "nuevo"
  const [idDiagnostico, setIdDiagnostico] = useState("");
  const [nombreDiagnostico, setNombreDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    aviso.limpiar();

    if (modo === "existente" && !idDiagnostico) {
      aviso.error("Elegí un diagnóstico de la lista.");
      return;
    }
    if (modo === "nuevo" && !nombreDiagnostico.trim()) {
      aviso.error("Escribí el nombre del diagnóstico nuevo.");
      return;
    }

    const cuerpo =
      modo === "existente"
        ? { idDiagnostico: Number(idDiagnostico) }
        : { nuevoDiagnostico: { nombreDiagnostico, tratamiento } };

    setGuardando(true);
    try {
      const r = await api.patch(`/urgencias/${urgencia.idAtencion}/finalizar`, cuerpo);
      onFinalizada(r.message);
    } catch (error) {
      aviso.error(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="modal-close" onClick={onCerrar}>&times;</span>
        <h3>Finalizar atención</h3>
        <p className="info-sub">
          <PrioridadChip prioridad={urgencia.prioridad} />{" "}
          <strong>{urgencia.paciente.nombre} {urgencia.paciente.apellido}</strong> — {urgencia.motivo}
        </p>
        <Mensaje mensaje={aviso.mensaje} />

        <form className="form-col" onSubmit={handleSubmit}>
          <div className="selector-modo">
            <button type="button" className={modo === "existente" ? "btn" : "btn btn-secundario"} onClick={() => setModo("existente")}>
              Elegir diagnóstico
            </button>
            <button type="button" className={modo === "nuevo" ? "btn" : "btn btn-secundario"} onClick={() => setModo("nuevo")}>
              Cargar uno nuevo
            </button>
          </div>

          {modo === "existente" ? (
            <select className="campo" value={idDiagnostico} onChange={(e) => setIdDiagnostico(e.target.value)}>
              <option value="">-- Seleccione un diagnóstico --</option>
              {diagnosticos.map((d) => (
                <option key={d.idDiagnostico} value={d.idDiagnostico}>{d.nombreDiagnostico}</option>
              ))}
            </select>
          ) : (
            <>
              <input className="campo" type="text" maxLength="100" placeholder="Nombre del diagnóstico nuevo" value={nombreDiagnostico} onChange={(e) => setNombreDiagnostico(e.target.value)} />
              <textarea className="campo" rows="3" maxLength="300" placeholder="Tratamiento (opcional)" value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} />
              <p className="info-sub">Queda guardado en el catálogo para usarlo en otras atenciones.</p>
            </>
          )}

          <div className="acciones-modal">
            <button type="button" className="btn btn-secundario" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn" disabled={guardando}>Guardar y finalizar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
