import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";

import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";

/*
 * Atencion es la clase PADRE (abstracta) del modelo de dominio:
 *      Atencion <|-- Consulta   (atención por turno)
 *      Atencion <|-- Urgencia   (atención por guardia)
 *
 * Las dos hijas se guardan en UNA SOLA tabla (`atencion`) y una columna
 * ("tipoAtencion") dice de qué clase es cada fila. Esto en MikroORM se llama
 * "Single Table Inheritance". Acá van solo los datos COMUNES a las dos.
 */
@Entity({
    abstract: true,
    // Nombre de la propiedad que hace de discriminador (se declara más abajo)
    discriminatorColumn: "tipoAtencion",
    // valor guardado en la columna -> nombre de la clase hija
    discriminatorMap: { consulta: "Consulta", urgencia: "Urgencia" },
})
export abstract class Atencion {

    @PrimaryKey({ autoincrement: true, fieldName: 'idAtencion' })
    idAtencion!: number;

    // En una Consulta es la fecha del turno; en una Urgencia, la fecha de llegada (la pone el servidor)
    @Property({ fieldName: 'fechaAtencion' })
    fechaAtencion!: Date;

    // En una Consulta es la hora del turno; en una Urgencia, la hora de llegada (la pone el servidor)
    @Property({ fieldName: 'horaAtencion' })
    horaAtencion!: string;

    @Property({ fieldName: 'nroIngreso' })
    nroIngreso!: number;

    @Property({ nullable: true })
    estado?: string;

    /*
     * Columna discriminadora. La declaramos A MANO con su fieldName real:
     * si no, MikroORM la nombra solo en snake_case ("tipo_atencion") y la
     * base real tiene "tipoAtencion" -> daría "Unknown column".
     * No se asigna a mano: cada clase hija la completa en su constructor.
     */
    @Property({ fieldName: 'tipoAtencion' })
    tipoAtencion!: string;

    @ManyToOne(() => Paciente, { fieldName: 'idPaciente' })
    paciente!: Paciente;

    // Opcional a nivel base: una Urgencia en espera todavía no tiene médico.
    // Consulta lo vuelve obligatorio (ver Consulta.entity.ts).
    @ManyToOne(() => Medico, { fieldName: 'matricula', nullable: true })
    medico?: Medico | null;

    @ManyToOne(() => Diagnostico, { nullable: true, fieldName: 'idDiagnostico' })
    diagnostico?: Diagnostico;

}
