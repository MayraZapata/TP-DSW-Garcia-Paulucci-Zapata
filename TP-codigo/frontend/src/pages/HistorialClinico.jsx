import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function HistorialClinico() {
  const navigate = useNavigate();
  const { rol, usuario } = useAuth();

  const [dni, setDni] = useState("");
  const [infoPaciente, setInfoPaciente] = useState("");
  const [atenciones, setAtenciones] = useState([]);
  const [modalAtencion, setModalAtencion] = useState(null);

  async function cargarPorId(idPaciente) {
    try {
      const data = await api.get(`/atenciones/paciente/${idPaciente}`);
      setAtenciones(data);
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
    const dniInput = dni.trim();
    if (!dniInput) {
      alert("Por favor, ingrese un DNI.");
      return;
    }
    try {
      const todas = await api.get("/atenciones");
      const delPaciente = todas.filter((a) => a.paciente && String(a.paciente.dni) === String(dniInput));

      if (delPaciente.length === 0) {
        setInfoPaciente(`No se encontraron atenciones para el DNI: ${dniInput}`);
        setAtenciones([]);
        return;
      }

      const p = delPaciente[0].paciente;
      setInfoPaciente(`Historial de: ${p.nombre} ${p.apellido} (DNI: ${p.dni})`);
      setAtenciones(delPaciente);
    } catch {
      alert("Ocurrió un error al consultar el historial por DNI.");
    }
  }

  return (
    <div>
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h2>Historial Clínico</h2>

      <div className="buscador-box">
        <label htmlFor="inputDni"><strong>DNI Paciente:</strong></label>
        <input type="text" id="inputDni" placeholder="Ingrese DNI del paciente" value={dni} disabled={rol === "PACIENTE"} onChange={(e) => setDni(e.target.value)} />
        {rol !== "PACIENTE" && <button onClick={buscarPorDni}>Buscar Historial</button>}
      </div>

      <div style={{ marginBottom: 15, fontWeight: "bold", color: "#333" }}>{infoPaciente}</div>

      <table>
        <thead>
          <tr><th>Fecha</th><th>Hora</th><th>Médico</th><th>Especialidad</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {atenciones.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: "center" }}>
              {rol === "PACIENTE" ? "No posee atenciones registradas." : "Ingrese un DNI de paciente para consultar."}
            </td></tr>
          ) : (
            atenciones.map((atencion) => {
              const fechaStr = atencion.fechaAtencion ? atencion.fechaAtencion.split("T")[0] : "N/A";
              const medicoNombre = atencion.medico ? `Dr/a. ${atencion.medico.nombre} ${atencion.medico.apellido}` : "N/A";
              const especialidad = atencion.medico?.especialidad?.nombreEspecialidad || "General";
              return (
                <tr key={atencion.idAtencion}>
                  <td>{fechaStr}</td>
                  <td>{atencion.horaAtencion || ""} hs</td>
                  <td>{medicoNombre}</td>
                  <td>{especialidad}</td>
                  <td><strong>{atencion.estado ? atencion.estado.toUpperCase() : "DESCONOCIDO"}</strong></td>
                  <td>
                    {atencion.estado === "atendido" && atencion.diagnostico ? (
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