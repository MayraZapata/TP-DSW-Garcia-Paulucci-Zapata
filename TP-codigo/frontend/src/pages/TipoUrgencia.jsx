import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCrud from "../hooks/useCrud";

export default function TipoUrgencia() {
  const navigate = useNavigate();
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud("/tiposUrgencia");

  const [nombre, setNombre] = useState("");
  const [descripcionTipo, setDescripcionTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");

  function handleEditar(id) {
    const tipo = items.find((t) => t.idTipo === id);
    if (!tipo) return;
    setNombre(tipo.nombre || "");
    setDescripcionTipo(tipo.descripcionTipo || "");
    editar(id);
  }

  function handleCancelar() {
    setNombre("");
    setDescripcionTipo("");
    cancelarEdicion();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await guardar({ nombre, descripcionTipo: descripcionTipo || undefined });
      setNombre("");
      setDescripcionTipo("");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Estás seguro de eliminar este tipo de urgencia?")) return;
    try {
      await eliminar(id);
    } catch (error) {
      alert(error.message);
    }
  }

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return items;
    return items.filter(
      (t) => t.nombre?.toLowerCase().includes(termino) || t.descripcionTipo?.toLowerCase().includes(termino)
    );
  }, [items, busqueda]);

  return (
    <div className="contenedor">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h1>CRUD Tipos de Urgencia</h1>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre del Tipo de Urgencia" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="text" placeholder="Descripción (opcional)" value={descripcionTipo} onChange={(e) => setDescripcionTipo(e.target.value)} />
        <button type="submit">{editingId !== null ? "Guardar cambios" : "Guardar Tipo de Urgencia"}</button>
        {editingId !== null && <button type="button" onClick={handleCancelar}>Cancelar edición</button>}
      </form>

      <hr />
      <h2>Tipos de Urgencia registrados</h2>
      <input type="text" placeholder="Buscar por nombre o descripción..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <ul>
        {filtrados.map((tipo) => (
          <li key={tipo.idTipo}>
            <strong>{tipo.nombre}</strong>
            {tipo.descripcionTipo && <> — {tipo.descripcionTipo}</>}
            <br />
            <button onClick={() => handleEliminar(tipo.idTipo)}>Eliminar</button>
            <button onClick={() => handleEditar(tipo.idTipo)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}