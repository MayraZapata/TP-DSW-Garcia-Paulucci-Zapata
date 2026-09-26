import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";

export default function TurnosPaciente() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [turnos, setTurnos] = useState([]);

  const cargarMisTurnos = useCallback(async () => {
    const idPaciente = usuario?.idPaciente;
    if (!idPaciente) return;
    try {
      const data = await api.get(`/atenciones/paciente/${idPaciente}`);
      setTurnos(data);
    } catch {
      setTurnos([]);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line
    cargarMisTurnos();
  }, [cargarMisTurnos]);

  async function handleCancelar(idAtencion) {
    if (!confirm("¿Estás seguro de que querés cancelar este turno?")) return;
    try {
      await api.patch(`/atenciones/${idAtencion}/cancelar`, {});
      alert("Turno cancelado con éxito");
      cargarMisTurnos();
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  const ahora = new Date();

  return (
    <div>
      <h2>Mis Turnos Reservados</h2>

      <table>
        <thead>
          <tr><th>Fecha</th><th>Hora</th><th>Médico</th><th>Especialidad</th><th>Estado</th><th>Acción</th></tr>
        </thead>
        <tbody>
          {turnos.length === 0 ? (
            <tr><td colSpan="6">No tienes turnos reservados.</td></tr>
          ) : (
            turnos.map((turno) => {
              const fechaStr = turno.fechaAtencion.split("T")[0];
              const fechaHoraTurno = new Date(`${fechaStr}T${turno.horaAtencion}`);
              const yaPaso = fechaHoraTurno < ahora;
              const esCancelable = turno.estado === "pendiente" && !yaPaso;

              return (
                <tr key={turno.idAtencion}>
                  <td>{fechaStr}</td>
                  <td>{turno.horaAtencion} hs</td>
                  <td>Dr/a. {turno.medico ? `${turno.medico.nombre} ${turno.medico.apellido}` : "N/A"}</td>
                  <td>{turno.medico?.especialidad?.nombreEspecialidad || "General"}</td>
                  <td><strong>{turno.estado.toUpperCase()}</strong></td>
                  <td>
                    {esCancelable ? (
                      <button style={{ color: "red" }} onClick={() => handleCancelar(turno.idAtencion)}>Cancelar</button>
                    ) : (
                      <span style={{ color: "gray" }}>No disponible</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <br />
      <button onClick={() => navigate("/menu")}>Volver al Menú</button>
    </div>
  );
}