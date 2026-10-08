import { useState, useMemo, useEffect } from "react";
import useFetchList from "../hooks/useFetchList";
import { api } from "../api/client";

// Colores simples para cada estado del turno
const COLOR_ESTADO = {
  pendiente: "#B26A00",
  atendido: "#2E7D32",
  cancelado: "#C0392B",
  ausente: "#7A6A55",
};

// ---------------------------------------------------------------
// MODAL (componente interno, solo se usa en este archivo)
// Recibe por "props":
//   - paciente: el paciente elegido (objeto que vino de /api/pacientes)
//   - onCerrar: función que el padre le presta para avisar "cerrame"
// ---------------------------------------------------------------
function TurnosPacienteModal({ paciente, onCerrar }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Corre una vez cuando el modal aparece: pide los turnos de ESTE paciente
  useEffect(() => {
    let cancelado = false; // por si el modal se cierra antes de que llegue la respuesta

    async function cargarTurnos() {
      try {
        const data = await api.get(`/atenciones/paciente/${paciente.idPaciente}`);
        if (!cancelado) setTurnos(data);
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargarTurnos();
    return () => { cancelado = true; };
  }, [paciente.idPaciente]);

  // Del más reciente al más viejo (copiamos con [...turnos] para no mutar el estado)
  const ordenados = [...turnos].sort((a, b) => {
    const fa = `${a.fechaAtencion.split("T")[0]}T${a.horaAtencion}`;
    const fb = `${b.fechaAtencion.split("T")[0]}T${b.horaAtencion}`;
    return fb.localeCompare(fa);
  });

  return (
    // Fondo oscuro: click afuera = cerrar
    <div className="modal" onClick={onCerrar}>
      {/* stopPropagation: un click ADENTRO de la caja no cierra el modal */}
      <div className="modal-content modal-ancho" onClick={(e) => e.stopPropagation()}>
        <span className="modal-close" onClick={onCerrar}>&times;</span>

        <h3>Turnos de {paciente.nombre} {paciente.apellido}</h3>
        <p className="info-sub">DNI: {paciente.dni || "N/A"}</p>

        {cargando && <p>Cargando turnos...</p>}
        {error && <p className="mensaje mensaje-error">{error}</p>}

        {!cargando && !error && (
          ordenados.length === 0 ? (
            <p className="info-sub">Este paciente no tiene turnos.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                  <th>Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((t) => (
                  <tr key={t.idAtencion}>
                    <td>{t.fechaAtencion.split("T")[0]}</td>
                    <td>{t.horaAtencion} hs</td>
                    <td>{t.medico ? `Dr/a. ${t.medico.nombre} ${t.medico.apellido}` : "N/A"}</td>
                    <td>{t.medico?.especialidad?.nombreEspecialidad || "General"}</td>
                    <td>
                      <strong style={{ color: COLOR_ESTADO[t.estado] }}>
                        {t.estado?.toUpperCase()}
                      </strong>
                    </td>
                    <td>{t.diagnostico?.nombreDiagnostico || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// PÁGINA: listado de pacientes
// ---------------------------------------------------------------
export default function ListadoPacienteTurnos() {
  // Trae la lista de pacientes del backend (GET /api/pacientes)
  const pacientes = useFetchList("/pacientes");

  const [busqueda, setBusqueda] = useState("");
  // null = modal cerrado. Con un paciente = modal abierto para ese paciente.
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return pacientes;
    return pacientes.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.apellido?.toLowerCase().includes(termino) ||
        p.dni?.toLowerCase().includes(termino)
    );
  }, [pacientes, busqueda]);

  return (
    <div className="gestion">
      <div className="gestion-header"><h1>Turnos por Paciente</h1></div>

      <div className="gestion-lista">
        <input
          className="campo"
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="gestion-lista-items">
          {filtrados.length === 0 ? (
            <p className="info-sub">No hay pacientes para mostrar.</p>
          ) : (
            filtrados.map((p) => (
              <div className="item-card" key={p.idPaciente}>
                <strong>{p.nombre} {p.apellido}</strong>
                <p style={{ margin: "6px 0 0" }}>
                  DNI: {p.dni || "N/A"}<br />
                  Obra Social: {p.obraSocial?.nombreObra ?? "Sin obra social"}
                </p>
                <div className="item-card-acciones">
                  <button className="btn" onClick={() => setPacienteSeleccionado(p)}>
                    Ver turnos
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Solo se dibuja si hay un paciente seleccionado */}
      {pacienteSeleccionado && (
        <TurnosPacienteModal
          key={pacienteSeleccionado.idPaciente}
          paciente={pacienteSeleccionado}
          onCerrar={() => setPacienteSeleccionado(null)}
        />
      )}
    </div>
  );
}
