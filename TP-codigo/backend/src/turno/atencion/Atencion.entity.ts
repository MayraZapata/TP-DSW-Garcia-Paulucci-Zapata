import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";

import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";
import { TipoUrgencia } from "../tipoUrgencia/tipoUrgencia.entity.js";

@Entity()
export class Atencion {

    @PrimaryKey({ autoincrement: true, fieldName: 'idAtencion' })
    idAtencion!: number;

    @Property({ fieldName: 'fechaAtencion' }) // <-- Agregamos fieldName
    fechaAtencion!: Date;

    @Property({ fieldName: 'horaAtencion' }) // <-- Agregamos fieldName
    horaAtencion!: string;

    @Property({ fieldName: 'nroIngreso' }) // <-- Agregamos fieldName
    nroIngreso!: number;

    @Property({ nullable: true })
    estado?: string;

    @ManyToOne(() => Paciente, { fieldName: 'idPaciente' })
    paciente!: Paciente;

    @ManyToOne(() => Medico, { fieldName: 'matricula' })
    medico!: Medico;

    @ManyToOne(() => Diagnostico, { nullable: true })
    diagnostico?: Diagnostico;

    @ManyToOne(() => TipoUrgencia, { nullable: true })
    tipoUrgencia?: TipoUrgencia;

}