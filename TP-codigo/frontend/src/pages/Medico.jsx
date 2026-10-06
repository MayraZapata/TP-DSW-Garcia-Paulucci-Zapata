import { useState, useMemo } from "react";
import useCrud from "../hooks/useCrud";
import useFetchList from "../hooks/useFetchList";
import { unicosPor } from "../utils/unicos";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "../components/Mensaje";

export default function Medico() {
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud("/medicos");
  const especialidades = unicosPor(useFetchList("/especialidades"), "nombreEspecialidad");

  const [matricula, setMatricula] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [idEspecialidad, setIdEspecialidad] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const aviso = useMensaje();

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
    aviso.limpiar();
    try {
      if (editingId !== null) {
        await guardar({ nombre, apellido, nombreUsuario, password, idEspecialidad });
      } else {
        await guardar({ matricula, nombre, apellido, nombreUsuario, password, idEspecialidad });
      }
      limpiarFormulario();
    } catch (error) {
      aviso.error(error.message);
    }
  }

  async function handleEliminar(matriculaMedico) {
    if (!confirm("¿Estás seguro de eliminar este médico?")) return;
    aviso.limpiar();
    try {
      await eliminar(matriculaMedico);
    } catch (error) {
      aviso.error(error.message);
    }
  }

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
    <div className="gestion">
      <div className="gestion-header"><h1>Gestión de Médicos</h1></div>
      <Mensaje mensaje={aviso.mensaje} />

      <div className="gestion-cuerpo">
        <form className="gestion-form" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? "Editar médico" : "Nuevo médico"}</h2>
          <input className="campo" type="number" placeholder="Matrícula" value={matricula} disabled={editingId !== null} onChange={(e) => setMatricula(e.target.value)} />
          <input className="campo" type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className="campo" type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          <input className="campo" type="text" placeholder="Nombre de Usuario" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
          <input className="campo" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className="campo" value={idEspecialidad} onChange={(e) => setIdEspecialidad(e.target.value)}>
            <option value="">--Seleccione especialidad--</option>
            {especialidades.map((esp) => (
              <option key={esp.idEspecialidad} value={esp.idEspecialidad}>{esp.nombreEspecialidad}</option>
            ))}
          </select>
          <button type="submit" className="btn">{editingId !== null ? "Guardar cambios" : "Guardar médico"}</button>
          {editingId !== null && <button type="button" className="btn btn-secundario" onClick={handleCancelar}>Cancelar edición</button>}
        </form>

        <div className="gestion-lista">
          <input className="campo" type="text" placeholder="Buscar por nombre, apellido o especialidad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="gestion-lista-items">
            {filtrados.length === 0 ? (
              <p className="info-sub">No hay médicos para mostrar.</p>
            ) : (
              filtrados.map((medico) => (
                <div className="item-card" key={medico.matricula}>
                  <strong>Dr/a. {medico.nombre} {medico.apellido}</strong>
                  <p style={{ margin: "6px 0 0" }}>
                    Matrícula: {medico.matricula}<br />
                    Usuario: {medico.nombreUsuario}<br />
                    Especialidad: {medico.especialidad?.nombreEspecialidad}
                  </p>
                  <div className="item-card-acciones">
                    <button className="btn btn-secundario" onClick={() => handleEditar(medico.matricula)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => handleEliminar(medico.matricula)}>Eliminar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}