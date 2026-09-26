import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCrud from "../hooks/useCrud";

export default function ObraSocial() {
  const navigate = useNavigate();
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
    <div className="contenedor">
      <button className="volver" onClick={() => navigate("/menu")}>Volver</button>
      <h1>CRUD Obras Sociales</h1>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre de la Obra Social" value={nombreObra} onChange={(e) => setNombreObra(e.target.value)} />
        <input type="number" placeholder="Monto" step="0.01" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} />
        <button type="submit">{editingId !== null ? "Guardar cambios" : "Guardar Obra Social"}</button>
        {editingId !== null && <button type="button" onClick={handleCancelar}>Cancelar edición</button>}
      </form>

      <hr />
      <h2>Obras Sociales registradas</h2>
      <input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <ul>
        {filtradas.map((obra) => (
          <li key={obra.idObra}>
            <strong>{obra.nombreObra}</strong> — ${obra.monto}
            <br />
            <button onClick={() => handleEliminar(obra.idObra)}>Eliminar</button>
            <button onClick={() => handleEditar(obra.idObra)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}