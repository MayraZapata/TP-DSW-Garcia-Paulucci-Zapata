import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";
import { unicosPor } from "../utils/unicos";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "../components/Mensaje";

// Genera intervalos de 30 minutos desde las 08:00 hasta las 18:00 hs
function generarHorarios(inicio = 8, fin = 18, paso = 30) {
  const horarios = [];
  for (let hora = inicio; hora <= fin; hora++) {
    for (let min = 0; min < 60; min += paso) {
      // Si llegamos a la hora fin (18:00), no generar 18:30
      if (hora === fin && min > 0) break;
      const h = String(hora).padStart(2, "0");
      const m = String(min).padStart(2, "0");
      horarios.push(`${h}:${m}`);
    }
  }
  return horarios;
}
const HORARIOS_DISPONIBLES = generarHorarios(8, 18, 30);

export default function Turnos() {
  const navigate = useNavigate();
  const { rol, usuario } = useAuth();
  const especialidadesRaw = useFetchList("/especialidades");
  const aviso = useMensaje();

  const [idEspecialidad, setIdEspecialidad] = useState("");
  const [medicos, setMedicos] = useState([]);
  const [matriculaMedico, setMatriculaMedico] = useState("");
  const [pacientes, setPacientes] = useState([]);
  const [idPaciente, setIdPaciente] = useState("");
  const [fechaAtencion, setFechaAtencion] = useState("");
  const [horaAtencion, setHoraAtencion] = useState("");
  const [horariosOcupados, setHorariosOcupados] = useState([]);

const especialidades = unicosPor(especialidadesRaw, "nombreEspecialidad");

// Fecha actual en formato YYYY-MM-DD en hora local
const hoy = new Date().toLocaleDateString("en-CA");

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

  // Consultar disponibilidad (horarios ocupados) al seleccionar médico y fecha
  useEffect(() => {
    // Si falta médico o fecha, no disparamos petición ni modificamos estado síncronamente
    if (!matriculaMedico || !fechaAtencion) return;
    let activo = true;
    async function cargarHorariosOcupados() {
      try {
        const ocupados = await api.get(
          `/atenciones/horarios-ocupados?matricula=${matriculaMedico}&fecha=${fechaAtencion}`
        );
        if (activo) {
          setHorariosOcupados(ocupados);
        }
      } catch {
        if (activo) {
          setHorariosOcupados([]);
        }
      }
    }
    cargarHorariosOcupados();
    // Limpieza por si el usuario cambia médico/fecha mientras la petición viaja, descartamos la anterior
    return () => {
      activo = false;
    };
  }, [matriculaMedico, fechaAtencion]);

  // Si no hay médico y fecha seleccionados, no hay horarios ocupados que restar
  const ocupadosActuales = matriculaMedico && fechaAtencion ? horariosOcupados : [];
  const horariosDisponibles = HORARIOS_DISPONIBLES.filter(
    (hora) => !ocupadosActuales.includes(hora)
  );


  async function handleReservar(e) {
    e.preventDefault();
    const idPacienteFinal = rol === "PACIENTE" ? usuario?.idPaciente : idPaciente;

    if (!idPacienteFinal || !matriculaMedico || !fechaAtencion || !horaAtencion) {
      aviso.error("Por favor complete todos los campos obligatorios");
      return;
    }

    if (fechaAtencion < hoy) {
      aviso.error("La fecha del turno no puede ser anterior al día de hoy");
      return;
    }

    try {
      await api.post("/atenciones", {
        idPaciente: Number(idPacienteFinal),
        matriculaMedico: Number(matriculaMedico),
        fechaAtencion,
        horaAtencion,
      });
      aviso.exito("¡Turno reservado con éxito!");
      setIdEspecialidad("");
      setMatriculaMedico("");
      setIdPaciente("");
      setFechaAtencion("");
      setHoraAtencion("");
    } catch (error) {
      aviso.error(error.message);
    }
  }

  return (
    <div className="contenedor">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h1>Solicitar Turno Médico</h1>
      <Mensaje mensaje={aviso.mensaje} />

      <form onSubmit={handleReservar}>
        <label htmlFor="idEspecialidad">Especialidad:</label>
        <select id="idEspecialidad" value={idEspecialidad} onChange={(e) => setIdEspecialidad(e.target.value)}>
          <option value="">-- Seleccionar Especialidad --</option>
          {especialidades.map((esp) => (
            <option key={esp.idEspecialidad} value={esp.idEspecialidad}>{esp.nombreEspecialidad}</option>
          ))}
        </select>

        <label htmlFor="matriculaMedico">Médico:</label>
        <select id="matriculaMedico" value={matriculaMedico} onChange={(e) => {setMatriculaMedico(e.target.value); setHoraAtencion(""); }} disabled={!idEspecialidad}>
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
        <input type="date" id="fechaAtencion" min={hoy} value={fechaAtencion} onChange={(e) => {setFechaAtencion(e.target.value); setHoraAtencion(""); }}/>

        <label htmlFor="horaAtencion">Hora:</label>
        <select id="horaAtencion" value={horaAtencion} onChange={(e) => setHoraAtencion(e.target.value)} disabled={!matriculaMedico || !fechaAtencion}>
          <option value="">
            {!matriculaMedico || !fechaAtencion
              ? "-- Seleccione primero médico y fecha --"
              : horariosDisponibles.length === 0
              ? "-- No quedan horarios disponibles para este día --"
              : "-- Seleccionar Horario --"}
          </option> {horariosDisponibles.map((hora) => ( <option key={hora} value={hora}> {hora} hs </option> ))}
        </select>

        <button type="submit">Confirmar Reserva</button>
      </form>
    </div>
  );
}