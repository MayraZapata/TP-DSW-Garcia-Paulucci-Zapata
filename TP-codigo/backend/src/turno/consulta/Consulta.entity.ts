import { Entity } from "@mikro-orm/core";
import { Atencion } from "../atencion/Atencion.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";

// Consulta: la atención que se hace por TURNO (reservar, agenda, mis turnos, reportes).
// No agrega columnas propias: usa las de Atencion. Tiene siempre médico asignado.
@Entity({ discriminatorValue: "consulta" })
export class Consulta extends Atencion {
  // `declare` solo le dice a TypeScript que en una Consulta el médico siempre está
  // (en Atencion es opcional por las urgencias). No crea ninguna propiedad nueva en runtime.
  declare medico: Medico;

  constructor() {
    super();
    this.tipoAtencion = "consulta";
    this.estado = "pendiente";
  }
}
