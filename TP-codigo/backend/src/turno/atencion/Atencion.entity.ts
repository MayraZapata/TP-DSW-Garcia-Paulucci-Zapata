import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";

import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";
import { TipoUrgencia } from "../tipoUrgencia/tipoUrgencia.entity.js";

@Entity()
export class Atencion {

    @PrimaryKey()
    idAtencion!: number;

    @Property()
    fechaAtencion!: Date;

    @Property()
    horaAtencion!: string;

    @Property()
    nroIngreso!: number;

    @Property({ nullable: true })
    estado?: string;

    @ManyToOne(() => Paciente)
    paciente!: Paciente;

    @ManyToOne(() => Medico)
    medico!: Medico;

    @ManyToOne(() => Diagnostico, { nullable: true })
    diagnostico?: Diagnostico;

    @ManyToOne(() => TipoUrgencia, { nullable: true })
    tipoUrgencia?: TipoUrgencia;

}