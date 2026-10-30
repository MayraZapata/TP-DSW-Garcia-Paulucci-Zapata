import { useId, useState } from "react";
import { esTipoOtro, normalizarTexto } from "../utils/tiposUrgencia";

export default function BuscadorTipoUrgencia({ tipos, idTipo, onChange }) {
  const idLista = useId();
  
  const [escribiendo, setEscribiendo] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const elegido = tipos.find((t) => String(t.idTipo) === String(idTipo));
  const texto = escribiendo ?? elegido?.nombre ?? "";
  const consulta = normalizarTexto(escribiendo);
  const otro = tipos.find(esTipoOtro);

  const coincidencias = tipos.filter((t) => !esTipoOtro(t) && normalizarTexto(t.nombre).includes(consulta));
  const otroCoincide = Boolean(otro) && normalizarTexto(otro.nombre).includes(consulta);
  const sinResultados = consulta !== "" && coincidencias.length === 0 && !otroCoincide;
  const opciones = coincidencias.map((tipo) => ({ tipo, usarTexto: false }));
  if (otro && (consulta === "" || sinResultados || otroCoincide)) {
    opciones.push({ tipo: otro, usarTexto: sinResultados });
  }
  const posicionActiva = Math.min(activo, opciones.length - 1);

  function elegir(opcion) {
    const escrito = (escribiendo ?? "").trim();
    setEscribiendo(null);
    setAbierto(false);
    onChange(String(opcion.tipo.idTipo), opcion.usarTexto ? escrito : "");
  }

  function alEscribir(valor) {
    setEscribiendo(valor);
    setAbierto(true);
    setActivo(0);
    
    if (elegido) onChange("", "");
  }

  function alPresionarTecla(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAbierto(true);
      setActivo(Math.min(posicionActiva + 1, opciones.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo(Math.max(posicionActiva - 1, 0));
    } else if (e.key === "Enter" && abierto) {
      e.preventDefault();
      if (opciones[posicionActiva]) elegir(opciones[posicionActiva]);
    } else if (e.key === "Escape") {
      setAbierto(false);
    }
  }

  return (
    <div className="combo-tipo">
      <input
        className="campo"
        type="text"
        role="combobox"
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-autocomplete="list"
        aria-activedescendant={abierto && opciones.length ? `${idLista}-${posicionActiva}` : undefined}
        autoComplete="off"
        placeholder="Tipo de urgencia (escribí para buscar)"
        value={texto}
        onChange={(e) => alEscribir(e.target.value)}
        onFocus={() => setAbierto(true)}
        onClick={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onKeyDown={alPresionarTecla}
      />

      {abierto && (
        <ul className="combo-lista" id={idLista} role="listbox">
          {opciones.map((op, i) => (
            <li
              key={op.tipo.idTipo}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={String(op.tipo.idTipo) === String(idTipo)}
              className={`combo-opcion${i === posicionActiva ? " activa" : ""}${esTipoOtro(op.tipo) ? " combo-opcion-otro" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(op);
              }}
              onMouseEnter={() => setActivo(i)}
            >
              {op.usarTexto ? (
                <>
                  <strong>Otro</strong>
                  <small className="combo-nota">No está en la lista: usar «{(escribiendo ?? "").trim()}» como descripción</small>
                </>
              ) : (
                <>
                  <strong>{op.tipo.nombre}</strong>
                  {op.tipo.descripcionTipo && <small>{op.tipo.descripcionTipo}</small>}
                </>
              )}
            </li>
          ))}
          {opciones.length === 0 && (
            <li className="combo-vacio">
              {tipos.length === 0 ? "No hay tipos de urgencia cargados." : `No hay un tipo que coincida con «${(escribiendo ?? "").trim()}».`}
            </li>
          )}
        </ul>
      )}

      {!abierto && !elegido && escribiendo?.trim() && (
        <p className="combo-ayuda">Elegí una opción de la lista (si no está, elegí «Otro»).</p>
      )}
    </div>
  );
}
