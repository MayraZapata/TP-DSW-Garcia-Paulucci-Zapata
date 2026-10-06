import { useState } from "react";
import useFetchList from "../hooks/useFetchList";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "./Mensaje";
import { unicosPor } from "../utils/unicos";

const VACIO = { nombre: "", apellido: "", dni: "", nombreUsuario: "", password: "", idObra: "" };

function desdePaciente(p) {
  if (!p) return VACIO;
  return {
    nombre: p.nombre || "",
    apellido: p.apellido || "",
    dni: p.dni || "",
    nombreUsuario: p.nombreUsuario || "",
    password: "",
    idObra: p.obraSocial?.idObra ?? "",
  };
}

export default function PacienteForm({ paciente, titulo, textoGuardar = "Guardar", mensajeExito, className = "form-col", onSubmit, onCancelar }) {
  const editando = Boolean(paciente);
  const aviso = useMensaje();
  const obras = unicosPor(useFetchList("/obrasSociales"), "nombreObra");
  const [v, setV] = useState(() => desdePaciente(paciente));
  const set = (campo) => (e) => setV((x) => ({ ...x, [campo]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    aviso.limpiar();
    const datos = {
      nombre: v.nombre,
      apellido: v.apellido,
      dni: v.dni,
      nombreUsuario: v.nombreUsuario,
      idObra: v.idObra === "" ? null : Number(v.idObra),
    };
    if (!editando) datos.password = v.password;
    try {
      await onSubmit(datos);
      if (!editando) setV(VACIO);
      if (mensajeExito) aviso.exito(mensajeExito);
    } catch (error) {
      aviso.error(error.message);
    }
  }

  return (
    <form className={className} onSubmit={handleSubmit}>
      {titulo && <h2>{titulo}</h2>}
      <Mensaje mensaje={aviso.mensaje} />
      <input className="campo" type="text" placeholder="Nombre" value={v.nombre} onChange={set("nombre")} />
      <input className="campo" type="text" placeholder="Apellido" value={v.apellido} onChange={set("apellido")} />
      <input className="campo" type="text" placeholder="DNI" value={v.dni} onChange={set("dni")} />
      <input className="campo" type="text" placeholder="Nombre de Usuario" value={v.nombreUsuario} onChange={set("nombreUsuario")} />
      <input
        className="campo"
        type="password"
        placeholder={editando ? "Contraseña (se cambia por separado)" : "Contraseña"}
        value={v.password}
        disabled={editando}
        onChange={set("password")}
      />
      <select className="campo" value={v.idObra} onChange={set("idObra")}>
        <option value="">Sin obra social</option>
        {obras.map((o) => (
          <option key={o.idObra} value={o.idObra}>{o.nombreObra}</option>
        ))}
      </select>
      <button type="submit" className="btn">{textoGuardar}</button>
      {onCancelar && <button type="button" className="btn btn-secundario" onClick={onCancelar}>Cancelar edición</button>}
    </form>
  );
}