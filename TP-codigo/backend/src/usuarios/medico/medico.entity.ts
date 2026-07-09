import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

import { Especialidad } from "../cualidadesUsr/especialidad/especialidad.entity.js";
//import { Atencion } from "../../turno/atencion/Atencion.entity.js";
import { Usuario } from "../usuario.abstract.js";


@Entity()
export class Medico extends Usuario {

    @PrimaryKey()
    matricula!: number;

    @Property()
    nombre!: string;

    @Property()
    apellido!: string;

    @ManyToOne(() => Especialidad, { fieldName: "idEspecialidad",  nullable: true })
    especialidad?: Especialidad;

    /*@OneToMany(() => Atencion, atencion => atencion.medico)
    atenciones = new Collection<Atencion>(this);
    */

}