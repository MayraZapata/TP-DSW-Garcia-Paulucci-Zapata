import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

import { ObraSocial } from "../cualidadesUsr/obraSocial/obraSocial.entity.js";
//import { Atencion } from "../../turno/atencion/Atencion.entity.js";
import { Usuario } from "../usuario.abstract.js";

@Entity()
export class Paciente extends Usuario {

    @PrimaryKey({ fieldName: "idPaciente" })
    idPaciente?: number;     
    //la razón de que sea opcional es que se autogenera en la base de datos, por lo que no es necesario pasarla al crear un paciente

    @Property()
    nombre!: string;

    @Property()
    apellido!: string;

    @Property()
    dni!: string;

    @ManyToOne(() => ObraSocial, { fieldName: "idObra", nullable: true })
    obraSocial?: ObraSocial;

    /*@OneToMany(() => Atencion, atencion => atencion.paciente)
    atenciones = new Collection<Atencion>(this);*/

}