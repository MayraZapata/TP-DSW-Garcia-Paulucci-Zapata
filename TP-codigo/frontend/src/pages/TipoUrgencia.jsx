import { useState, useMemo } from "react";
import useCrud from "../hooks/useCrud";

export default function TipoUrgencia() {
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
    <div className="gestion">
      <div className="gestion-header"><h1>Gestión de Tipos de Urgencia</h1></div>

      <div className="gestion-cuerpo">
        <form className="gestion-form" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? "Editar tipo de urgencia" : "Nuevo tipo de urgencia"}</h2>
          <input className="campo" type="text" placeholder="Nombre del Tipo de Urgencia" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className="campo" type="text" placeholder="Descripción (opcional)" value={descripcionTipo} onChange={(e) => setDescripcionTipo(e.target.value)} />
          <button type="submit" className="btn">{editingId !== null ? "Guardar cambios" : "Guardar tipo de urgencia"}</button>
          {editingId !== null && <button type="button" className="btn btn-secundario" onClick={handleCancelar}>Cancelar edición</button>}
        </form>

        <div className="gestion-lista">
          <input className="campo" type="text" placeholder="Buscar por nombre o descripción..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="gestion-lista-items">
            {filtrados.length === 0 ? (
              <p className="info-sub">No hay tipos de urgencia para mostrar.</p>
            ) : (
              filtrados.map((tipo) => (
                <div className="item-card" key={tipo.idTipo}>
                  <strong>{tipo.nombre}</strong>
                  {tipo.descripcionTipo && <p style={{ margin: "6px 0 0" }}>{tipo.descripcionTipo}</p>}
                  <div className="item-card-acciones">
                    <button className="btn btn-secundario" onClick={() => handleEditar(tipo.idTipo)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => handleEliminar(tipo.idTipo)}>Eliminar</button>
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