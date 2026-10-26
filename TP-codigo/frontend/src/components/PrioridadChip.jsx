import { PRIORIDADES } from "../config/prioridades";

// Etiqueta de color de la prioridad (rojo / amarillo / verde).
// Lleva el NOMBRE del color escrito y no solo el color, para que se entienda también si no se distinguen los colores.
export default function PrioridadChip({ prioridad }) {
  const p = PRIORIDADES.find((x) => x.valor === prioridad);
  if (!p) return null;

  return (
    <span className={`prioridad-chip prioridad-${p.valor}`} title={p.detalle}>
      {p.etiqueta}
    </span>
  );
}
