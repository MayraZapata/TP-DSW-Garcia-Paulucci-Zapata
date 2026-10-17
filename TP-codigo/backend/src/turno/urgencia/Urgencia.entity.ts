import { Entity, ManyToOne, Property } from "@mikro-orm/core";

import { Atencion } from "../atencion/Atencion.entity.js";
import { TipoUrgencia } from "../tipoUrgencia/tipoUrgencia.entity.js";

/*
 * Urgencia = atención por GUARDIA. Se registra sin turno, entra a una lista
 * de espera y la atiende un médico de una especialidad habilitada.
 *
 * Estados: en_espera -> en_atencion -> finalizada   (o cancelada)
 */
@Entity({ discriminatorValue: "urgencia" })
export class Urgencia extends Atencion {

    // Por qué consulta el paciente (texto libre que escribe quien lo registra)
    @Property({ nullable: true })
    motivo?: string;

    // "rojo" (inmediata) | "amarillo" (intermedia) | "verde" (puede esperar).
    // La decide una PERSONA al ingresar al paciente: NO se deduce del tipo
    // (puede llegar un "Corte" leve o uno gravísimo).
    @Property({ type: "string", nullable: true })
    prioridad!: string;

    // Clasificación (tabla TipoUrgencia: "Convulsiones", "Corte", ...).
    // fieldName explícito: sin él MikroORM buscaría "tipo_urgencia_idTipo";
    // la columna real de la base se llama "idTipo".
    @ManyToOne(() => TipoUrgencia, { fieldName: 'idTipo', nullable: true })
    tipoUrgencia!: TipoUrgencia;

    constructor() {
        super();
        this.tipoAtencion = "urgencia";
    }

}
