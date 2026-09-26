import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";

export default function ReporteTurnos() {
  const navigate = useNavigate();
  const { rol, usuario } = useAuth();
  const medicosLista = useFetchList("/medicos");

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroMedico, setFiltroMedico] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [detalle, setDetalle] = useState(null);

  const filtrarTurnos = useCallback(async (fecha, matricula) => {
    let query = "/atenciones/buscar?";
    if (fecha) query += `fecha=${fecha}&`;
    if (matricula) query += `matricula=${matricula}&`;
    try {
      const data = await api.get(query);
      setTurnos(data);
    } catch {
      setTurnos([]);
    }
  }, []);

  useEffect(() => {
    if (rol === "MEDICO" && usuario?.matricula) {
      // eslint-disable-next-line
      setFiltroMedico(String(usuario.matricula));
      filtrarTurnos(null, usuario.matricula);
    } else {
      filtrarTurnos(null, null);
    }
    // eslint-disable-next-line
  }, [rol, usuario]);

  function handleLimpiar() {
    setFiltroFecha("");
    const matriculaFija = rol === "MEDICO" ? filtroMedico : "";
    if (rol !== "MEDICO") setFiltroMedico("");
    filtrarTurnos(null, matriculaFija || null);
  }

  return (
    <div>
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h2>Consulta y Filtro de Turnos</h2>

      <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
        <div>
          <label>Fecha:</label>
          <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
        </div>
        <div>
          <label>Médico:</label>
          <select value={filtroMedico} onChange={(e) => setFiltroMedico(e.target.value)} disabled={rol === "MEDICO"}>
            <option value="">-- Todos los Médicos --</option>
            {medicosLista.map((m) => (
              <option key={m.matricula} value={m.matricula}>Dr/a. {m.nombre} {m.apellido}</option>
            ))}
          </select>
        </div>
        <button onClick={() => filtrarTurnos(filtroFecha, filtroMedico)}>Filtrar</button>
        <button onClick={handleLimpiar}>Limpiar Filtros</button>
      </div>

      <table>
        <thead>
          <tr><th>Fecha</th><th>Hora</th><th>Médico</th><th>Paciente</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {turnos.length === 0 ? (
            <tr><td colSpan="6">No se encontraron turnos con los filtros seleccionados.</td></tr>
          ) : (
            turnos.map((t) => {
              const fechaStr = t.fechaAtencion ? t.fechaAtencion.split("T")[0] : "";
              return (
                <tr key={t.idAtencion}>
                  <td>{fechaStr}</td>
                  <td>{t.horaAtencion} hs</td>
                  <td>Dr/a. {t.medico ? `${t.medico.nombre} ${t.medico.apellido}` : "N/A"}</td>
                  <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : "N/A"}</td>
                  <td><strong>{t.estado ? t.estado.toUpperCase() : ""}</strong></td>
                  <td><button onClick={() => setDetalle(t)}>Ver Detalle</button></td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {detalle && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={() => setDetalle(null)}>&times;</span>
            <h3>Detalle Completo del Turno</h3>
            <p><strong>Nro Ingreso / Atención:</strong> {detalle.idAtencion}</p>
            <p><strong>Fecha y Hora:</strong> {detalle.fechaAtencion ? detalle.fechaAtencion.split("T")[0] : ""} a las {detalle.horaAtencion} hs</p>
            <p><strong>Estado Actual:</strong> <span style={{ textTransform: "uppercase" }}>{detalle.estado}</span></p>
            <hr />
            <h4>Información del Paciente</h4>
            <p><strong>Nombre:</strong> {detalle.paciente?.nombre || ""} {detalle.paciente?.apellido || ""}</p>
            <p><strong>DNI:</strong> {detalle.paciente?.dni || "N/A"}</p>
            <hr />
            <h4>Información del Médico</h4>
            <p><strong>Médico:</strong> Dr/a. {detalle.medico?.nombre || ""} {detalle.medico?.apellido || ""}</p>
            <p><strong>Matrícula:</strong> {detalle.medico?.matricula || "N/A"}</p>
            <p><strong>Especialidad:</strong> {detalle.medico?.especialidad?.nombreEspecialidad || "Sin asignar / General"}</p>
          </div>
        </div>
      )}
    </div>
  );
}