import { useState, useMemo } from "react";
import useCrud from "../hooks/useCrud";

export default function GestionCrud({ endpoint, idField, titulo, tituloNuevo, tituloEditar, campos, placeholderBusqueda, filtrarPor, renderItem, mensajeConfirmarEliminar, mensajeVacio }) {
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud(endpoint);
  const valoresIniciales = useMemo(() => Object.fromEntries(campos.map((c) => [c.name, ""])), [campos]);
  const [valores, setValores] = useState(valoresIniciales);
  const [busqueda, setBusqueda] = useState("");

  function setCampo(name, value) {
    setValores((v) => ({ ...v, [name]: value }));
  }

  function handleEditar(id) {
    const item = items.find((i) => i[idField] === id);
    if (!item) return;
    const nuevosValores = Object.fromEntries(
      campos.map((c) => [c.name, c.getValorEdicion ? c.getValorEdicion(item) : item[c.name] ?? ""])
    );
    setValores(nuevosValores);
    editar(id);
  }

  function handleCancelar() {
    setValores(valoresIniciales);
    cancelarEdicion();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const datos = Object.fromEntries(
      campos.map((c) => [c.name, c.toEnvio ? c.toEnvio(valores[c.name]) : valores[c.name] || undefined])
    );
    try {
      await guardar(datos);
      setValores(valoresIniciales);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleEliminar(id) {
    if (!confirm(mensajeConfirmarEliminar)) return;
    try {
      await eliminar(id);
    } catch (error) {
      alert(error.message);
    }
  }

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return items;
    return items.filter((item) => filtrarPor(item, termino));
  }, [items, busqueda, filtrarPor]);

  return (
    <div className="gestion">
      <div className="gestion-header"><h1>{titulo}</h1></div>

      <div className="gestion-cuerpo">
        <form className="gestion-form" onSubmit={handleSubmit}>
          <h2>{editingId !== null ? tituloEditar : tituloNuevo}</h2>
          {campos.map((c) => (
            <input
              key={c.name}
              className="campo"
              type={c.type || "text"}
              placeholder={c.placeholder}
              value={valores[c.name]}
              disabled={c.disabledAlEditar && editingId !== null}
              step={c.step}
              min={c.min}
              onChange={(e) => setCampo(c.name, e.target.value)}
            />
          ))}
          <button type="submit" className="btn">{editingId !== null ? "Guardar cambios" : `Guardar`}</button>
          {editingId !== null && <button type="button" className="btn btn-secundario" onClick={handleCancelar}>Cancelar edición</button>}
        </form>

        <div className="gestion-lista">
          <input className="campo" type="text" placeholder={placeholderBusqueda} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="gestion-lista-items">
            {filtrados.length === 0 ? (
              <p className="info-sub">{mensajeVacio}</p>
            ) : (
              filtrados.map((item) => (
                <div className="item-card" key={item[idField]}>
                  {renderItem(item)}
                  <div className="item-card-acciones">
                    <button className="btn btn-secundario" onClick={() => handleEditar(item[idField])}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => handleEliminar(item[idField])}>Eliminar</button>
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