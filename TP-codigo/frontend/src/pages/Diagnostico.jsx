import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCrud from "../hooks/useCrud";

export default function Diagnostico() {
  const navigate = useNavigate();
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

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return items;
    return items.filter(
      (d) =>
        d.nombreDiagnostico?.toLowerCase().includes(termino) ||
        d.tratamiento?.toLowerCase().includes(termino)
    );
  }, [items, busqueda]);

  return (
    <div className="contenedor">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h1>CRUD Diagnósticos</h1>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre del Diagnóstico" value={nombreDiagnostico} onChange={(e) => setNombreDiagnostico(e.target.value)} />
        <input type="text" placeholder="Tratamiento (opcional)" value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} />
        <button type="submit">{editingId !== null ? "Guardar cambios" : "Guardar Diagnóstico"}</button>
        {editingId !== null && <button type="button" onClick={handleCancelar}>Cancelar edición</button>}
      </form>

      <hr />
      <h2>Diagnósticos registrados</h2>
      <input type="text" placeholder="Buscar por nombre o tratamiento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <ul>
        {filtradas.map((diag) => (
          <li key={diag.idDiagnostico}>
            <strong>{diag.nombreDiagnostico}</strong>
            {diag.tratamiento && <> — {diag.tratamiento}</>}
            <br />
            <button onClick={() => handleEliminar(diag.idDiagnostico)}>Eliminar</button>
            <button onClick={() => handleEditar(diag.idDiagnostico)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}