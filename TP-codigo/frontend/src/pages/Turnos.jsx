import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";

export default function Turnos() {
  const navigate = useNavigate();
  const { rol, usuario } = useAuth();
  const especialidadesRaw = useFetchList("/especialidades");

  const [idEspecialidad, setIdEspecialidad] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [matriculaMedico, setMatriculaMedico] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [idPaciente, setIdPaciente] = useState("");
  const [fechaAtencion, setFechaAtencion] = useState("");
  const [horaAtencion, setHoraAtencion] = useState("");

  const especialidades = useMemo(() => {
    const vistos = new Set();
    return especialidadesRaw.filter((esp) => {
      const nombreLimpio = (esp.nombreEspecialidad || "").trim().toLowerCase();
      if (!nombreLimpio || vistos.has(nombreLimpio)) return false;
      vistos.add(nombreLimpio);
      return true;
    });
  }, [especialidadesRaw]);

  // Cascada: al cambiar la especialidad, recargar médicos de esa especialidad
  useEffect(() => {
    if (!idEspecialidad) {
        // eslint-disable-next-line
      setMedicos([]);
      setMatriculaMedico("");
      return;
    }
    (async () => {
      try {
        const data = await api.get(`/medicos/especialidad/${idEspecialidad}`);
        setMedicos(data);
      } catch {
        setMedicos([]);
      }
    })();
  }, [idEspecialidad]);

  // Cargar lista completa de pacientes solo si NO es un paciente logueado
  useEffect(() => {
    if (rol === "PACIENTE") return;
    (async () => {
      try {
        const data = await api.get("/pacientes");
        setPacientes(data);
      } catch {
        setPacientes([]);
      }
    })();
  }, [rol]);

  async function handleReservar(e) {
    e.preventDefault();
    const idPacienteFinal = rol === "PACIENTE" ? usuario?.idPaciente : idPaciente;

    if (!idPacienteFinal || !matriculaMedico || !fechaAtencion || !horaAtencion) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      await api.post("/atenciones", {
        idPaciente: Number(idPacienteFinal),
        matriculaMedico: Number(matriculaMedico),
        fechaAtencion,
        horaAtencion,
      });
      alert("¡Turno reservado con éxito!");
      navigate("/menu");
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div className="contenedor">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h1>Solicitar Turno Médico</h1>

      <form onSubmit={handleReservar}>
        <label htmlFor="idEspecialidad">Especialidad:</label>
        <select id="idEspecialidad" value={idEspecialidad} onChange={(e) => setIdEspecialidad(e.target.value)}>
          <option value="">-- Seleccionar Especialidad --</option>
          {especialidades.map((esp) => (
            <option key={esp.idEspecialidad} value={esp.idEspecialidad}>{esp.nombreEspecialidad}</option>
          ))}
        </select>

        <label htmlFor="matriculaMedico">Médico:</label>
        <select id="matriculaMedico" value={matriculaMedico} onChange={(e) => setMatriculaMedico(e.target.value)} disabled={!idEspecialidad}>
          <option value="">{idEspecialidad ? "-- Seleccionar Médico --" : "-- Primero seleccione una especialidad --"}</option>
          {medicos.map((m) => (
            <option key={m.matricula} value={m.matricula}>Dr/a. {m.nombre} {m.apellido}</option>
          ))}
        </select>

        {rol === "PACIENTE" ? (
          <div>
            <label>Paciente:</label>
            <select disabled>
              <option>{usuario?.nombre} {usuario?.apellido}</option>
            </select>
          </div>
        ) : (
          <div>
            <label htmlFor="idPaciente">Paciente:</label>
            <select id="idPaciente" value={idPaciente} onChange={(e) => setIdPaciente(e.target.value)}>
              <option value="">-- Seleccionar Paciente --</option>
              {pacientes.map((p) => (
                <option key={p.idPaciente} value={p.idPaciente}>{p.nombre} {p.apellido} (DNI: {p.dni})</option>
              ))}
            </select>
          </div>
        )}

        <label htmlFor="fechaAtencion">Fecha:</label>
        <input type="date" id="fechaAtencion" value={fechaAtencion} onChange={(e) => setFechaAtencion(e.target.value)} />

        <label htmlFor="horaAtencion">Hora:</label>
        <input type="time" id="horaAtencion" value={horaAtencion} onChange={(e) => setHoraAtencion(e.target.value)} />

        <button type="submit">Confirmar Reserva</button>
      </form>
    </div>
  );
}