import { useState, useMemo } from "react";
import useCrud from "../hooks/useCrud";
import PacienteForm from "../components/PacienteForm";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "../components/Mensaje";

export default function Paciente() {
  const { items, editingId, guardar, eliminar, editar, cancelarEdicion } = useCrud("/pacientes");
  const [busqueda, setBusqueda] = useState("");
  const aviso = useMensaje();

  const enEdicion = items.find((p) => p.idPaciente === editingId);

  async function handleEliminar(id) {
    if (!confirm("¿Estás seguro de eliminar este paciente?")) return;
    aviso.limpiar();
    try {
      await eliminar(id);
    } catch (error) {
      aviso.error(error.message);
    }
  }

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return items;
    return items.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.apellido?.toLowerCase().includes(termino) ||
        p.dni?.toLowerCase().includes(termino) ||
        p.obraSocial?.nombreObra?.toLowerCase().includes(termino)
    );
  }, [items, busqueda]);

  return (
    <div className="gestion">
      <div className="gestion-header"><h1>Gestión de Pacientes</h1></div>
      <Mensaje mensaje={aviso.mensaje} />

      <div className="gestion-cuerpo">
        <PacienteForm
          key={editingId ?? "nuevo"}
          className="gestion-form"
          titulo={enEdicion ? "Editar paciente" : "Nuevo paciente"}
          textoGuardar={enEdicion ? "Guardar cambios" : "Guardar paciente"}
          paciente={enEdicion}
          onSubmit={guardar}
          onCancelar={enEdicion ? cancelarEdicion : null}
        />

        <div className="gestion-lista">
          <input className="campo" type="text" placeholder="Buscar por nombre, apellido, DNI u obra social..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="gestion-lista-items">
            {filtrados.length === 0 ? (
              <p className="info-sub">No hay pacientes para mostrar.</p>
            ) : (
              filtrados.map((p) => (
                <div className="item-card" key={p.idPaciente}>
                  <strong>{p.nombre} {p.apellido}</strong>
                  <p style={{ margin: "6px 0 0" }}>
                    DNI: {p.dni || "N/A"}<br />
                    Usuario: {p.nombreUsuario}<br />
                    Obra Social: {p.obraSocial?.nombreObra ?? "Sin obra social"}
                  </p>
                  <div className="item-card-acciones">
                    <button className="btn btn-secundario" onClick={() => editar(p.idPaciente)}>Editar</button>
                    <button className="btn btn-peligro" onClick={() => handleEliminar(p.idPaciente)}>Eliminar</button>
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