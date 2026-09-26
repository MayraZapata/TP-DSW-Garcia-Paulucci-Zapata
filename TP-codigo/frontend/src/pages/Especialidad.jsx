import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCrud from "../hooks/useCrud";

export default function Especialidad() {
  const navigate = useNavigate();
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud("/especialidades");

  const [nombreEspecialidad, setNombreEspecialidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [busqueda, setBusqueda] = useState("");

  function handleEditar(id) {
    const especialidad = items.find((e) => e.idEspecialidad === id);
    if (!especialidad) return;
    setNombreEspecialidad(especialidad.nombreEspecialidad || "");
    setDescripcion(especialidad.descripcion || "");
    editar(id);
  }

  function handleCancelar() {
    setNombreEspecialidad("");
    setDescripcion("");
    cancelarEdicion();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await guardar({ nombreEspecialidad, descripcion: descripcion || undefined });
      setNombreEspecialidad("");
      setDescripcion("");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Estás seguro de eliminar esta especialidad?")) return;
    try {
      await eliminar(id);
    } catch (error) {
      alert(error.message);
    }
  }

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return items;
    return items.filter(
      (e) =>
        e.nombreEspecialidad?.toLowerCase().includes(termino) ||
        e.descripcion?.toLowerCase().includes(termino)
    );
  }, [items, busqueda]);

  return (
    <div className="contenedor">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h1>CRUD Especialidades</h1>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre de la Especialidad" value={nombreEspecialidad} onChange={(e) => setNombreEspecialidad(e.target.value)} />
        <input type="text" placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <button type="submit">{editingId !== null ? "Guardar cambios" : "Guardar Especialidad"}</button>
        {editingId !== null && <button type="button" onClick={handleCancelar}>Cancelar edición</button>}
      </form>

      <hr />
      <h2>Especialidades registradas</h2>
      <input type="text" placeholder="Buscar por nombre o descripción..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <ul>
        {filtradas.map((esp) => (
          <li key={esp.idEspecialidad}>
            <strong>{esp.nombreEspecialidad}</strong>
            {esp.descripcion && <> — {esp.descripcion}</>}
            <br />
            <button onClick={() => handleEliminar(esp.idEspecialidad)}>Eliminar</button>
            <button onClick={() => handleEditar(esp.idEspecialidad)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}