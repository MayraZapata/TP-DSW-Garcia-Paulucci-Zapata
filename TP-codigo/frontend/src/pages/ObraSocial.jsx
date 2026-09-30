import { useState, useMemo } from "react";
import useCrud from "../hooks/useCrud";

export default function ObraSocial() {
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud("/obrasSociales");

  const [nombreObra, setNombreObra] = useState("");
  const [monto, setMonto] = useState("");
  const [busqueda, setBusqueda] = useState("");

  function handleEditar(id) {
    const obra = items.find((o) => o.idObra === id);
    if (!obra) return;
    setNombreObra(obra.nombreObra || "");
    setMonto(obra.monto ?? "");
    editar(id);
  }

  function handleCancelar() {
    setNombreObra("");
    setMonto("");
    cancelarEdicion();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await guardar({ nombreObra, monto: Number(monto) });
      setNombreObra("");
      setMonto("");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Estás seguro de eliminar esta obra social?")) return;
    try {
      await eliminar(id);
    } catch (error) {
      alert(error.message);
    }
  }

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return items;
    return items.filter((o) => o.nombreObra?.toLowerCase().includes(termino));
  }, [items, busqueda]);

  return (
    <div className="gestion">
      <div className="gestion-header"><h1>Gestión de Obras Sociales</h1></div>

      <div className="gestion-cuerpo">
        <form className="gestion-form" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? "Editar obra social" : "Nueva obra social"}</h2>
          <input className="campo" type="text" placeholder="Nombre de la Obra Social" value={nombreObra} onChange={(e) => setNombreObra(e.target.value)} />
          <input className="campo" type="number" placeholder="Monto" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} />
          <button type="submit" className="btn">{editingId !== null ? "Guardar cambios" : "Guardar obra social"}</button>
          {editingId !== null && <button type="button" className="btn btn-secundario" onClick={handleCancelar}>Cancelar edición</button>}
        </form>

        <div className="gestion-lista">
          <input className="campo" type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="gestion-lista-items">
            {filtradas.length === 0 ? (
              <p className="info-sub">No hay obras sociales para mostrar.</p>
            ) : (
              filtradas.map((obra) => (
                <div className="item-card" key={obra.idObra}>
                  <strong>{obra.nombreObra}</strong>
                  <p style={{ margin: "6px 0 0" }}>Monto: ${obra.monto}</p>
                  <div className="item-card-acciones">
                    <button className="btn btn-secundario" onClick={() => handleEditar(obra.idObra)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => handleEliminar(obra.idObra)}>Eliminar</button>
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