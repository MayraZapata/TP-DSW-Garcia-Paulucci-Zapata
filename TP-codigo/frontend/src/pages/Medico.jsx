import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCrud from "../hooks/useCrud";
import useFetchList from "../hooks/useFetchList";

export default function Medico() {
  const navigate = useNavigate();
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud("/medicos");
  const especialidades = useFetchList("/especialidades");

  const [matricula, setMatricula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [idEspecialidad, setIdEspecialidad] = useState("");
  const [busqueda, setBusqueda] = useState("");

  function limpiarFormulario() {
    setMatricula("");
    setNombre("");
    setApellido("");
    setNombreUsuario("");
    setPassword("");
    setIdEspecialidad("");
  }

  function handleEditar(matriculaMedico) {
    const medico = items.find((m) => m.matricula === matriculaMedico);
    if (!medico) return;
    setMatricula(medico.matricula);
    setNombre(medico.nombre || "");
    setApellido(medico.apellido || "");
    setNombreUsuario(medico.nombreUsuario || "");
    setPassword("");
    setIdEspecialidad(medico.especialidad?.idEspecialidad || "");
    editar(matriculaMedico);
  }

  function handleCancelar() {
    limpiarFormulario();
    cancelarEdicion();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId !== null) {
        await guardar({ nombre, apellido, nombreUsuario, password, idEspecialidad });
      } else {
        await guardar({ matricula, nombre, apellido, nombreUsuario, password, idEspecialidad });
      }
      limpiarFormulario();
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleEliminar(matriculaMedico) {
    if (!confirm("¿Estás seguro de eliminar este médico?")) return;
    try {
      await eliminar(matriculaMedico);
    } catch (error) {
      alert(error.message);
    }
  }

  const especialidadesUnicas = useMemo(() => {
    const vistos = new Set();
    return especialidades.filter((esp) => {
      const nombreLimpio = (esp.nombreEspecialidad || "").trim().toLowerCase();
      if (!nombreLimpio || vistos.has(nombreLimpio)) return false;
      vistos.add(nombreLimpio);
      return true;
    });
  }, [especialidades]);

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return items;
    return items.filter((m) => {
      const esp = m.especialidad?.nombreEspecialidad || "";
      return (
        m.nombre?.toLowerCase().includes(termino) ||
        m.apellido?.toLowerCase().includes(termino) ||
        esp.toLowerCase().includes(termino) ||
        String(m.matricula).includes(termino)
      );
    });
  }, [items, busqueda]);

  return (
    <div className="contenedor">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h1>CRUD Médicos</h1>

      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="Matrícula" value={matricula} disabled={editingId !== null} onChange={(e) => setMatricula(e.target.value)} />
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
        <input type="text" placeholder="Nombre de Usuario" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label htmlFor="idEspecialidad">Especialidad</label>
        <select id="idEspecialidad" value={idEspecialidad} onChange={(e) => setIdEspecialidad(e.target.value)}>
          <option value="">General</option>
          {especialidadesUnicas.map((esp) => (
            <option key={esp.idEspecialidad} value={esp.idEspecialidad}>{esp.nombreEspecialidad}</option>
          ))}
        </select>
        <button type="submit">{editingId !== null ? "Guardar cambios" : "Guardar Médico"}</button>
        {editingId !== null && <button type="button" onClick={handleCancelar}>Cancelar edición</button>}
      </form>

      <hr />
      <h2>Médicos registrados</h2>
      <input type="text" placeholder="Buscar por nombre, apellido o especialidad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <ul>
        {filtrados.map((medico) => (
          <li key={medico.matricula}>
            <strong>Matrícula:</strong> {medico.matricula}<br />
            <strong>Nombre:</strong> {medico.nombre} {medico.apellido}<br />
            <strong>Usuario:</strong> {medico.nombreUsuario}<br />
            <strong>Especialidad:</strong> {medico.especialidad?.nombreEspecialidad || "Sin Asignar"}
            <br /><br />
            <button onClick={() => handleEliminar(medico.matricula)}>Eliminar</button>
            <button onClick={() => handleEditar(medico.matricula)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}