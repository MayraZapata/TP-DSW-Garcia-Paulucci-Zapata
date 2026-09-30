import { useState, useMemo } from "react";
import useCrud from "../hooks/useCrud";

export default function Especialidad() {
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
      (e) => e.nombreEspecialidad?.toLowerCase().includes(termino) || e.descripcion?.toLowerCase().includes(termino)
    );
  }, [items, busqueda]);

  return (
    <div className="gestion">
      <div className="gestion-header"><h1>Gestión de Especialidades</h1></div>

      <div className="gestion-cuerpo">
        <form className="gestion-form" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? "Editar especialidad" : "Nueva especialidad"}</h2>
          <input className="campo" type="text" placeholder="Nombre de la Especialidad" value={nombreEspecialidad} onChange={(e) => setNombreEspecialidad(e.target.value)} />
          <input className="campo" type="text" placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          <button type="submit" className="btn">{editingId !== null ? "Guardar cambios" : "Guardar especialidad"}</button>
          {editingId !== null && <button type="button" className="btn btn-secundario" onClick={handleCancelar}>Cancelar edición</button>}
        </form>

        <div className="gestion-lista">
          <input className="campo" type="text" placeholder="Buscar por nombre o descripción..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="gestion-lista-items">
            {filtradas.length === 0 ? (
              <p className="info-sub">No hay especialidades para mostrar.</p>
            ) : (
              filtradas.map((esp) => (
                <div className="item-card" key={esp.idEspecialidad}>
                  <strong>{esp.nombreEspecialidad}</strong>
                  {esp.descripcion && <p style={{ margin: "6px 0 0" }}>{esp.descripcion}</p>}
                  <div className="item-card-acciones">
                    <button className="btn btn-secundario" onClick={() => handleEditar(esp.idEspecialidad)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => handleEliminar(esp.idEspecialidad)}>Eliminar</button>
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