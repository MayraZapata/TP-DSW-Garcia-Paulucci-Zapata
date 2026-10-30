import { useState } from "react";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "./Mensaje";
import BuscadorTipoUrgencia from "./BuscadorTipoUrgencia";
import { unicosPor } from "../utils/unicos";
import { esTipoOtro } from "../utils/tiposUrgencia";
import { PRIORIDADES } from "../config/prioridades";


export default function IngresoUrgenciaForm({ urgencia, onGuardado, onCancelarEdicion }) {
  const editando = Boolean(urgencia);
  const aviso = useMensaje();
  const tipos = useFetchList("/tiposUrgencia");
  const obras = unicosPor(useFetchList("/obrasSociales"), "nombreObra");

  const [dni, setDni] = useState(urgencia?.paciente?.dni ?? "");
  const [busqueda, setBusqueda] = useState(editando ? { existe: true } : null);
  const [buscando, setBuscando] = useState(false);
  const [nombre, setNombre] = useState(urgencia?.paciente?.nombre ?? "");
  const [apellido, setApellido] = useState(urgencia?.paciente?.apellido ?? "");
  const [idObra, setIdObra] = useState(urgencia?.paciente?.obraSocial?.idObra ?? "");
  const [motivo, setMotivo] = useState(urgencia?.motivo ?? "");
  const [idTipo, setIdTipo] = useState(urgencia?.tipoUrgencia?.idTipo ?? "");
  const [detalleTipo, setDetalleTipo] = useState(urgencia?.detalleTipo ?? "");
  const [prioridad, setPrioridad] = useState(urgencia?.prioridad ?? "");

  const pacienteExiste = busqueda?.existe === true;
  const mostrarDetalle = esTipoOtro(tipos.find((t) => String(t.idTipo) === String(idTipo)));

  
  function cambiarTipo(valor, textoEscrito = "") {
    const nuevo = tipos.find((t) => String(t.idTipo) === String(valor));
    setIdTipo(valor);
    if (!esTipoOtro(nuevo)) {
      setDetalleTipo("");
    } else if (!mostrarDetalle) {
      setDetalleTipo(textoEscrito);
    }
  }

  function cambiarDni(valor) {
    setDni(valor);
    if (busqueda) {
      setBusqueda(null);
      setNombre("");
      setApellido("");
      setIdObra("");
    }
  }

  async function buscar() {
    if (buscando) return;
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

  function handleBuscar(e) {
    e.preventDefault();
    buscar();
  }

  function limpiar() {
    setDni("");
    setBusqueda(null);
    setNombre("");
    setApellido("");
    setIdObra("");
    setMotivo("");
    setIdTipo("");
    setDetalleTipo("");
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
        await api.put(`/urgencias/${urgencia.idAtencion}`, {
          motivo,
          idTipo: Number(idTipo),
          prioridad,
          ...(mostrarDetalle ? { detalleTipo } : {}),
        });
        onGuardado("Urgencia actualizada");
      } else {
        const r = await api.post("/urgencias", {
          dni,
          motivo,
          idTipo: Number(idTipo),
          prioridad,
          ...(mostrarDetalle ? { detalleTipo } : {}),
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
    <div className="gestion-form">
      <h2>{editando ? "Editar urgencia" : "Ingresar urgencia"}</h2>
      <Mensaje mensaje={aviso.mensaje} />

      {editando ? (
        <input className="campo" type="text" value={dni} disabled />
      ) : (
        <form className="fila-dni" onSubmit={handleBuscar}>
          <input
            className="campo"
            type="text"
            inputMode="numeric"
            placeholder="DNI del paciente"
            value={dni}
            onChange={(e) => cambiarDni(e.target.value)}
          />
          <button type="submit" className="btn" disabled={buscando}>
            {buscando ? "..." : "Buscar"}
          </button>
        </form>
      )}

      {busqueda && !editando && (
        <p className={pacienteExiste ? "ayuda-paciente ayuda-ok" : "ayuda-paciente ayuda-nuevo"}>
          {pacienteExiste
            ? "Paciente registrado: sus datos se completaron solos."
            : "Ese DNI no está registrado. Completá los datos: se registra al paciente y se le crea la cuenta (usuario y contraseña iniciales = su DNI)."}
        </p>
      )}

      {busqueda && (
        <form className="form-col form-etapa2" onSubmit={handleSubmit}>
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

          <BuscadorTipoUrgencia tipos={tipos} idTipo={idTipo} onChange={cambiarTipo} />

          {mostrarDetalle && (
            <div className="campo-condicional">
              <label htmlFor="detalle-tipo" className="etiqueta-campo">Describa la urgencia (opcional)</label>
              <textarea
                id="detalle-tipo"
                className="campo"
                rows="2"
                maxLength="150"
                value={detalleTipo}
                onChange={(e) => setDetalleTipo(e.target.value)}
              />
            </div>
          )}

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
          {editando && <button type="button" className="btn btn-secundario" onClick={onCancelarEdicion}>Cancelar edición</button>}
        </form>
      )}
    </div>
  );
}
