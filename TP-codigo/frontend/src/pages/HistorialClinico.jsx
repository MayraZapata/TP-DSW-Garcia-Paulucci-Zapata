import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "../components/Mensaje";
import PrioridadChip from "../components/PrioridadChip";
import { ESTADOS_URGENCIA } from "../config/prioridades";

export default function HistorialClinico() {
  const navigate = useNavigate();
  const { rol, usuario } = useAuth();

  const [dni, setDni] = useState("");
  const [infoPaciente, setInfoPaciente] = useState("");
  const [atenciones, setAtenciones] = useState([]);
  const [modalAtencion, setModalAtencion] = useState(null);
  const aviso = useMensaje();

  async function cargarPorId(idPaciente) {
    try {
      // Historial = consultas (por turno) + urgencias (por guardia). Cada una trae `tipoAtencion`.
      const data = await api.get(`/atenciones/historial/paciente/${idPaciente}`);
      setAtenciones(data.atenciones);
    } catch {
      setAtenciones([]);
    }
  }

  useEffect(() => {
    if (rol === "PACIENTE") {
      // eslint-disable-next-line
      setDni(usuario?.dni || "");
      setInfoPaciente(`Paciente: ${usuario?.nombre || ""} ${usuario?.apellido || ""} (DNI: ${usuario?.dni || "N/A"})`);
      if (usuario?.idPaciente) cargarPorId(usuario.idPaciente);
    } else {
      setInfoPaciente("Ingrese el DNI de un paciente y presione Buscar.");
    }
    // eslint-disable-next-line
  }, [rol]);

  async function buscarPorDni() {
    aviso.limpiar();
    const dniInput = dni.trim();
    if (!dniInput) {
      aviso.error("Por favor, ingrese un DNI.");
      return;
    }
    try {
      const data = await api.get(`/atenciones/historial/dni/${encodeURIComponent(dniInput)}`);
      const p = data.paciente;

      if (data.atenciones.length === 0) {
        setInfoPaciente(`${p.nombre} ${p.apellido} (DNI: ${p.dni}) todavía no tiene atenciones registradas.`);
        setAtenciones([]);
        return;
      }

      setInfoPaciente(`Historial de: ${p.nombre} ${p.apellido} (DNI: ${p.dni})`);
      setAtenciones(data.atenciones);
    } catch (error) {
      // Por ejemplo: "No existe un paciente con el DNI ..."
      setInfoPaciente("Ingrese el DNI de un paciente y presione Buscar.");
      setAtenciones([]);
      aviso.error(error.message);
    }
  }

  return (
    <div className="contenedor-pagina">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h2>Historial Clínico</h2>
      <Mensaje mensaje={aviso.mensaje} />
      <div className="buscador-box">
        <label htmlFor="inputDni"><strong>DNI Paciente:</strong></label>
        <input type="text" id="inputDni" placeholder="Ingrese DNI del paciente" value={dni} disabled={rol === "PACIENTE"} onChange={(e) => setDni(e.target.value)} />
        {rol !== "PACIENTE" && <button onClick={buscarPorDni}>Buscar Historial</button>}
      </div>
      <div style={{ marginBottom: 15, fontWeight: "bold", color: "#333" }}>{infoPaciente}</div>
      <table className="tabla-cards">
        <thead>
          <tr><th>Fecha</th><th>Hora</th><th>Tipo</th><th>Médico</th><th>Especialidad</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {atenciones.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                {rol === "PACIENTE" ? "No posee atenciones registradas." : "Ingrese un DNI de paciente para consultar."}
              </td>
            </tr>
          ) : (
            atenciones.map((atencion) => {
              const fechaStr = atencion.fechaAtencion ? atencion.fechaAtencion.split("T")[0] : "N/A";
              const esUrgencia = atencion.tipoAtencion === "urgencia";
              // Una urgencia en espera todavía no tiene médico asignado
              const medicoNombre = atencion.medico ? `Dr/a. ${atencion.medico.nombre} ${atencion.medico.apellido}` : esUrgencia ? "Sin asignar" : "N/A";
              const especialidad = atencion.medico?.especialidad?.nombreEspecialidad;
              const estadoTexto = esUrgencia ? ESTADOS_URGENCIA[atencion.estado] ?? atencion.estado : atencion.estado;
              // El turno se da por atendido con "atendido"; la urgencia, con "finalizada"
              const tieneDiagnostico = (atencion.estado === "atendido" || atencion.estado === "finalizada") && atencion.diagnostico;
              return (
                <tr key={atencion.idAtencion} className={esUrgencia ? `fila-urgencia prioridad-${atencion.prioridad}` : undefined}>
                  <td data-label="Fecha">{fechaStr}</td>
                  <td data-label="Hora">{atencion.horaAtencion || ""} hs</td>
                  <td data-label="Tipo">
                    {esUrgencia ? (
                      <span className="tipo-urgencia-celda">
                        <span><strong>Urgencia</strong> <PrioridadChip prioridad={atencion.prioridad} /></span>
                        <small>{atencion.tipoUrgencia?.nombre}{atencion.detalleTipo ? `: ${atencion.detalleTipo}` : ""}</small>
                      </span>
                    ) : ("Consulta")}
                  </td>
                  <td data-label="Médico">{medicoNombre}</td>
                  <td data-label="Especialidad">{especialidad}</td>
                  <td data-label="Estado"><strong>{estadoTexto ? estadoTexto.toUpperCase() : "DESCONOCIDO"}</strong></td>
                  <td data-label="Acción">
                    {tieneDiagnostico ? (
                      <button onClick={() => setModalAtencion(atencion)}>Ver Diagnóstico</button>
                    ) : (
                      <span style={{ color: "gray" }}>Sin detalle</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {modalAtencion && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setModalAtencion(null)}>&times;</span>
            <h3>Detalle del Diagnóstico</h3>
            {modalAtencion.tipoAtencion === "urgencia" && (
              <>
                <p><strong>Atención:</strong> Urgencia (guardia) <PrioridadChip prioridad={modalAtencion.prioridad} /></p>
                <p><strong>Tipo de urgencia:</strong> {modalAtencion.tipoUrgencia?.nombre || "Sin especificar"}</p>
                {modalAtencion.detalleTipo && <p><strong>Descripción:</strong> {modalAtencion.detalleTipo}</p>}
                <p><strong>Motivo:</strong> {modalAtencion.motivo || "Sin especificar"}</p>
              </>
            )}
            <p><strong>Fecha:</strong> {modalAtencion.fechaAtencion ? modalAtencion.fechaAtencion.split("T")[0] : "N/A"}</p>
            <p><strong>Médico:</strong> {modalAtencion.medico ? `Dr/a. ${modalAtencion.medico.nombre} ${modalAtencion.medico.apellido}` : "N/A"}</p>
            <p><strong>Diagnóstico:</strong> {modalAtencion.diagnostico?.nombreDiagnostico || "Sin especificar"}</p>
            <p><strong>Tratamiento / Indicaciones:</strong></p>
            <div style={{ background: "#f9f9f9", padding: 10, border: "1px solid #eee" }}>
              {modalAtencion.diagnostico?.tratamiento || "Sin indicaciones adicionales."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}