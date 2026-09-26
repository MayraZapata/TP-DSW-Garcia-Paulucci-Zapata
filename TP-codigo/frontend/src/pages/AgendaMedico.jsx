import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";

export default function AgendaMedico() {
  const navigate = useNavigate();
  const { rol, usuario } = useAuth();
  const medicosLista = useFetchList("/medicos");
  const diagnosticos = useFetchList("/diagnosticos");

  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState("");
  const [turnos, setTurnos] = useState([]);
  const [modalIdAtencion, setModalIdAtencion] = useState(null);
  const [selectDiagnostico, setSelectDiagnostico] = useState("");

  const cargarAgenda = useCallback(async (matricula) => {
    try {
      const data = await api.get(`/atenciones/medico/${matricula}`);
      setTurnos(data);
    } catch {
      setTurnos([]);
    }
  }, []);

  useEffect(() => {
    if (rol === "MEDICO" && usuario?.matricula) {
      // eslint-disable-next-line
      setMatriculaSeleccionada(usuario.matricula);
      cargarAgenda(usuario.matricula);
    }
    // eslint-disable-next-line
  }, [rol, usuario]);

  function handleSeleccionMedico(matricula) {
    setMatriculaSeleccionada(matricula);
    if (matricula) cargarAgenda(matricula);
    else setTurnos([]);
  }

  function abrirModal(idAtencion) {
    setModalIdAtencion(idAtencion);
    setSelectDiagnostico("");
  }

  function cerrarModal() {
    setModalIdAtencion(null);
    setSelectDiagnostico("");
  }

  async function handleGuardarDiagnostico(e) {
    e.preventDefault();
    if (!selectDiagnostico) {
      alert("Por favor seleccione un diagnóstico.");
      return;
    }
    try {
      const data = await api.patch(`/atenciones/${modalIdAtencion}/diagnostico`, {
        idDiagnostico: Number(selectDiagnostico),
        estado: "atendido",
      });
      alert(data.message || "Atención y diagnóstico guardados con éxito.");
      cerrarModal();
      cargarAgenda(matriculaSeleccionada);
    } catch (error) {
      alert(error.message);
    }
  }

  async function cambiarEstado(idAtencion, nuevoEstado) {
    try {
      await api.patch(`/atenciones/${idAtencion}/estado`, { estado: nuevoEstado });
      alert(`Estado del turno actualizado a: ${nuevoEstado}`);
      cargarAgenda(matriculaSeleccionada);
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div>
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h2>Agenda de Turnos</h2>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="selectMedico">Médico:</label>
        {rol === "MEDICO" ? (
          <select id="selectMedico" disabled>
            <option>Dr/a. {usuario?.nombre} {usuario?.apellido}</option>
          </select>
        ) : (
          <select id="selectMedico" value={matriculaSeleccionada} onChange={(e) => handleSeleccionMedico(e.target.value)}>
            <option value="">-- Seleccione Médico --</option>
            {medicosLista.map((m) => (
              <option key={m.matricula} value={m.matricula}>Dr/a. {m.nombre} {m.apellido}</option>
            ))}
          </select>
        )}
      </div>

      <table>
        <thead>
          <tr><th>Fecha</th><th>Hora</th><th>Paciente</th><th>DNI</th><th>Estado</th><th>Diagnóstico</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {turnos.length === 0 ? (
            <tr><td colSpan="7">No hay turnos registrados para este médico.</td></tr>
          ) : (
            turnos.map((t) => {
              const fechaStr = t.fechaAtencion ? t.fechaAtencion.split("T")[0] : "N/A";
              return (
                <tr key={t.idAtencion}>
                  <td>{fechaStr}</td>
                  <td>{t.horaAtencion} hs</td>
                  <td>{t.paciente ? `${t.paciente.nombre} ${t.paciente.apellido}` : "N/A"}</td>
                  <td>{t.paciente?.dni || "N/A"}</td>
                  <td><strong>{t.estado ? t.estado.toUpperCase() : "PENDIENTE"}</strong></td>
                  <td>{t.diagnostico?.nombreDiagnostico || <em style={{ color: "gray" }}>Sin diagnóstico</em>}</td>
                  <td>
                    {t.estado === "pendiente" ? (
                      <>
                        <button style={{ color: "green" }} onClick={() => abrirModal(t.idAtencion)}>Marcar Atendido</button>
                        <button style={{ color: "orange" }} onClick={() => cambiarEstado(t.idAtencion, "ausente")}>Marcar Ausente</button>
                      </>
                    ) : t.estado === "atendido" ? (
                      <button style={{ color: "blue" }} onClick={() => abrirModal(t.idAtencion)}>Editar Diagnóstico</button>
                    ) : (
                      <span style={{ color: "gray" }}>Finalizado</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {modalIdAtencion !== null && (
        <div className="modal">
          <div className="modal-content">
            <span className="modal-close" onClick={cerrarModal}>&times;</span>
            <h3>Asignar Diagnóstico</h3>
            <form onSubmit={handleGuardarDiagnostico}>
              <div className="form-group">
                <label htmlFor="selectDiagnostico">Seleccionar Diagnóstico:</label>
                <select id="selectDiagnostico" value={selectDiagnostico} onChange={(e) => setSelectDiagnostico(e.target.value)} required>
                  <option value="">-- Seleccione un Diagnóstico --</option>
                  {diagnosticos.map((d) => (
                    <option key={d.idDiagnostico} value={d.idDiagnostico}>{d.nombreDiagnostico}</option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: "right", marginTop: 20 }}>
                <button type="button" onClick={cerrarModal}>Cancelar</button>
                <button type="submit">Guardar y Finalizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}