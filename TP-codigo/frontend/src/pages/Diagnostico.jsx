import { useState, useMemo } from "react";
import useCrud from "../hooks/useCrud";

export default function Diagnostico() {
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud("/diagnosticos");

  const [nombreDiagnostico, setNombreDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [busqueda, setBusqueda] = useState("");

  function handleEditar(id) {
    const diagnostico = items.find((d) => d.idDiagnostico === id);
    if (!diagnostico) return;
    setNombreDiagnostico(diagnostico.nombreDiagnostico || "");
    setTratamiento(diagnostico.tratamiento || "");
    editar(id);
  }

  function handleCancelar() {
    setNombreDiagnostico("");
    setTratamiento("");
    cancelarEdicion();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await guardar({ nombreDiagnostico, tratamiento: tratamiento || undefined });
      setNombreDiagnostico("");
      setTratamiento("");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm("¿Estás seguro de eliminar este diagnóstico?")) return;
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
      (d) => d.nombreDiagnostico?.toLowerCase().includes(termino) || d.tratamiento?.toLowerCase().includes(termino)
    );
  }, [items, busqueda]);

  return (
    <div className="gestion">
      <div className="gestion-header"><h1>Gestión de Diagnósticos</h1></div>

      <div className="gestion-cuerpo">
        <form className="gestion-form" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? "Editar diagnóstico" : "Nuevo diagnóstico"}</h2>
          <input className="campo" type="text" placeholder="Nombre del Diagnóstico" value={nombreDiagnostico} onChange={(e) => setNombreDiagnostico(e.target.value)} />
          <input className="campo" type="text" placeholder="Tratamiento (opcional)" value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} />
          <button type="submit" className="btn">{editingId !== null ? "Guardar cambios" : "Guardar diagnóstico"}</button>
          {editingId !== null && <button type="button" className="btn btn-secundario" onClick={handleCancelar}>Cancelar edición</button>}
        </form>

        <div className="gestion-lista">
          <input className="campo" type="text" placeholder="Buscar por nombre o tratamiento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="gestion-lista-items">
            {filtrados.length === 0 ? (
              <p className="info-sub">No hay diagnósticos para mostrar.</p>
            ) : (
              filtrados.map((diag) => (
                <div className="item-card" key={diag.idDiagnostico}>
                  <strong>{diag.nombreDiagnostico}</strong>
                  {diag.tratamiento && <p style={{ margin: "6px 0 0" }}>{diag.tratamiento}</p>}
                  <div className="item-card-acciones">
                    <button className="btn btn-secundario" onClick={() => handleEditar(diag.idDiagnostico)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => handleEliminar(diag.idDiagnostico)}>Eliminar</button>
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