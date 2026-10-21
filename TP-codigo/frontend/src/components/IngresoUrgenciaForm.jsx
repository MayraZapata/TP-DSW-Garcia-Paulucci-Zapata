import { useState } from "react";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "./Mensaje";
import { unicosPor } from "../utils/unicos";
import { PRIORIDADES } from "../config/prioridades";

// Formulario del ADMIN para ingresar una urgencia (no hay recepcionista).
//
// Paso 1: se escribe el DNI y se busca.
//   - Si el paciente EXISTE: nombre, apellido y obra social se rellenan solos (no se pueden cambiar acá).
//   - Si NO existe: se completan nombre, apellido y obra social y se lo registra en el mismo ingreso;
//     el sistema le crea la cuenta con usuario y contraseña iniciales iguales a su DNI.
// Paso 2: motivo, tipo de urgencia y PRIORIDAD (se elige aparte del tipo, porque la decide una persona).
//
// Si recibe `urgencia`, funciona en modo EDICIÓN: solo cambian motivo, tipo y prioridad.
export default function IngresoUrgenciaForm({ urgencia, onGuardado, onCancelarEdicion }) {
  const editando = Boolean(urgencia);
  const aviso = useMensaje();
  const tipos = useFetchList("/tiposUrgencia");
  const obras = unicosPor(useFetchList("/obrasSociales"), "nombreObra");

  const [dni, setDni] = useState(urgencia?.paciente?.dni ?? "");
  // null = todavía no se buscó el DNI | { existe: true | false }
  const [busqueda, setBusqueda] = useState(editando ? { existe: true } : null);
  const [buscando, setBuscando] = useState(false);
  const [nombre, setNombre] = useState(urgencia?.paciente?.nombre ?? "");
  const [apellido, setApellido] = useState(urgencia?.paciente?.apellido ?? "");
  const [idObra, setIdObra] = useState(urgencia?.paciente?.obraSocial?.idObra ?? "");
  const [motivo, setMotivo] = useState(urgencia?.motivo ?? "");
  const [idTipo, setIdTipo] = useState(urgencia?.tipoUrgencia?.idTipo ?? "");
  const [prioridad, setPrioridad] = useState(urgencia?.prioridad ?? "");

  const pacienteExiste = busqueda?.existe === true;

  function cambiarDni(valor) {
    setDni(valor);
    // Si cambia el DNI hay que volver a buscar: lo que se había rellenado ya no corresponde
    if (busqueda) {
      setBusqueda(null);
      setNombre("");
      setApellido("");
      setIdObra("");
    }
  }

  async function buscar() {
    aviso.limpiar();
    if (!dni.trim()) {
      aviso.error("Escribí el DNI del paciente.");
      return;
    }
    setBuscando(true);
    try {
      const r = await api.get(`/pacientes/dni/${encodeURIComponent(dni.trim())}`);
      setBusqueda(r);
      if (r.existe) {
        setNombre(r.paciente.nombre);
        setApellido(r.paciente.apellido);
        setIdObra(r.paciente.obraSocial?.idObra ?? "");
      } else {
        setNombre("");
        setApellido("");
        setIdObra("");
      }
    } catch (error) {
      setBusqueda(null);
      aviso.error(error.message);
    } finally {
      setBuscando(false);
    }
  }

  function limpiar() {
    setDni("");
    setBusqueda(null);
    setNombre("");
    setApellido("");
    setIdObra("");
    setMotivo("");
    setIdTipo("");
    setPrioridad("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    aviso.limpiar();

    if (!motivo.trim() || !idTipo || !prioridad) {
      aviso.error("Completá el motivo, el tipo de urgencia y la prioridad.");
      return;
    }

    try {
      if (editando) {
        await api.put(`/urgencias/${urgencia.idAtencion}`, { motivo, idTipo: Number(idTipo), prioridad });
        onGuardado("Urgencia actualizada");
      } else {
        const r = await api.post("/urgencias", {
          dni,
          motivo,
          idTipo: Number(idTipo),
          prioridad,
          nombre,
          apellido,
          idObra: idObra === "" ? null : Number(idObra),
        });
        limpiar();
        onGuardado(r.message);
      }
    } catch (error) {
      aviso.error(error.message);
    }
  }

  return (
    <form className="gestion-form" onSubmit={handleSubmit}>
      <h2>{editando ? "Editar urgencia" : "Ingresar urgencia"}</h2>
      <Mensaje mensaje={aviso.mensaje} />

      <div className="fila-dni">
        <input
          className="campo"
          type="text"
          inputMode="numeric"
          placeholder="DNI del paciente"
          value={dni}
          disabled={editando}
          onChange={(e) => cambiarDni(e.target.value)}
        />
        {!editando && (
          <button type="button" className="btn" disabled={buscando} onClick={buscar}>
            {buscando ? "..." : "Buscar"}
          </button>
        )}
      </div>

      {busqueda && !editando && (
        <p className={pacienteExiste ? "ayuda-paciente ayuda-ok" : "ayuda-paciente ayuda-nuevo"}>
          {pacienteExiste
            ? "Paciente registrado: sus datos se completaron solos."
            : "Ese DNI no está registrado. Completá los datos: se registra al paciente y se le crea la cuenta (usuario y contraseña iniciales = su DNI)."}
        </p>
      )}

      {busqueda && (
        <>
          <input className="campo" type="text" placeholder="Nombre" value={nombre} disabled={pacienteExiste} onChange={(e) => setNombre(e.target.value)} />
          <input className="campo" type="text" placeholder="Apellido" value={apellido} disabled={pacienteExiste} onChange={(e) => setApellido(e.target.value)} />
          <select className="campo" value={idObra} disabled={pacienteExiste} onChange={(e) => setIdObra(e.target.value)}>
            <option value="">Sin obra social</option>
            {obras.map((o) => (
              <option key={o.idObra} value={o.idObra}>{o.nombreObra}</option>
            ))}
          </select>

          <textarea
            className="campo"
            rows="2"
            maxLength="300"
            placeholder="Motivo de la urgencia"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />

          <select className="campo" value={idTipo} onChange={(e) => setIdTipo(e.target.value)}>
            <option value="">-- Tipo de urgencia --</option>
            {tipos.map((t) => (
              <option key={t.idTipo} value={t.idTipo}>{t.nombre}</option>
            ))}
          </select>

          {/* La prioridad se elige APARTE del tipo: la decide una persona */}
          <fieldset className="prioridad-selector">
            <legend>Prioridad</legend>
            {PRIORIDADES.map((p) => (
              <label key={p.valor} className={`prioridad-opcion prioridad-${p.valor}${prioridad === p.valor ? " seleccionada" : ""}`}>
                <input type="radio" name="prioridad" value={p.valor} checked={prioridad === p.valor} onChange={() => setPrioridad(p.valor)} />
                <strong>{p.etiqueta}</strong>
                <span>{p.detalle}</span>
              </label>
            ))}
          </fieldset>

          <button type="submit" className="btn">{editando ? "Guardar cambios" : "Ingresar a la lista de espera"}</button>
        </>
      )}

      {editando && <button type="button" className="btn btn-secundario" onClick={onCancelarEdicion}>Cancelar edición</button>}
    </form>
  );
}
