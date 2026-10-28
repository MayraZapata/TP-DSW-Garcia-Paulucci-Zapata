import { useId, useState } from "react";
import { esTipoOtro, normalizarTexto } from "../utils/tiposUrgencia";

// Campo para elegir el tipo de urgencia ESCRIBIENDO: la lista se filtra sola mientras se tipea
// (sin tildes ni mayúsculas), en vez de recorrer un desplegable largo.
//   - Si lo que se escribe no está en la lista, aparece la opción «Otro»: al elegirla, lo escrito
//     pasa a ser la descripción de la urgencia (la persona puede corregirla).
//   - Se maneja con el mouse o con el teclado: flechas para moverse, Enter para elegir, Esc para cerrar.
// Props: tipos (lista de la tabla TipoUrgencia), idTipo (el elegido, o ""),
//        onChange(idTipo, textoEscrito) cuando se elige o se suelta un tipo.
export default function BuscadorTipoUrgencia({ tipos, idTipo, onChange }) {
  const idLista = useId();
  // null = se muestra el nombre del tipo elegido | texto = lo que la persona está escribiendo
  const [escribiendo, setEscribiendo] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);

  const elegido = tipos.find((t) => String(t.idTipo) === String(idTipo));
  const texto = escribiendo ?? elegido?.nombre ?? "";
  const consulta = normalizarTexto(escribiendo);
  const otro = tipos.find(esTipoOtro);

  // Opciones de la lista: los tipos que coinciden con lo escrito, y «Otro» siempre al final.
  // «Otro» ofrece "usar lo escrito como descripción" solo cuando hay texto y NADA coincide
  // (si lo escrito es «otro» o «ot», se está buscando ese tipo y no hay nada que usar como descripción).
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
    // Al tocar el texto se suelta el tipo elegido: así el texto y el tipo nunca quedan desfasados
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
      // Con la lista abierta, Enter ELIGE la opción marcada; no envía el formulario
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
            // onMouseDown (y no onClick) para elegir antes de que el campo pierda el foco y cierre la lista
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
