import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/core";

import { Atencion } from "../atencion/Atencion.entity.js";
import { TipoUrgencia } from "../tipoUrgencia/tipoUrgencia.entity.js";

// Prioridad de la urgencia. La decide una PERSONA (no se deduce del tipo de urgencia).
// El orden de esta lista es el orden de atención: rojo primero. Es el mismo orden del ENUM de la base.
export const PRIORIDADES = ["rojo", "amarillo", "verde"] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export const ESTADOS_URGENCIA = ["en_espera", "en_atencion", "finalizada", "cancelada"] as const;
export type EstadoUrgencia = (typeof ESTADOS_URGENCIA)[number];

// Urgencia: la atención que se hace por GUARDIA. Se guarda en la misma tabla que Consulta.
// Las columnas propias (motivo, prioridad, idTipo) quedan en NULL para las consultas.
@Entity({ discriminatorValue: "urgencia" })
export class Urgencia extends Atencion {

    @Property({ fieldName: "motivo", length: 300 })
    motivo!: string;

    @Enum({ items: () => PRIORIDADES, fieldName: "prioridad" })
    prioridad!: Prioridad;

    // fieldName: "idTipo" es la columna real. Sin esto MikroORM buscaría "tipo_urgencia_idTipo".
    @ManyToOne(() => TipoUrgencia, { fieldName: "idTipo" })
    tipoUrgencia!: TipoUrgencia;

}
