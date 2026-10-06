import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from "@mikro-orm/core";

import { ObraSocial } from "../cualidadesUsr/obraSocial/obraSocial.entity.js";
//import { Atencion } from "../../turno/atencion/Atencion.entity.js";
import { Usuario } from "../usuario.abstract.js";

@Entity()
export class Paciente extends Usuario {

    @PrimaryKey({ fieldName: "idPaciente" })
    idPaciente?: number;     

    @Property()
    nombre!: string;

    @Property()
    apellido!: string;

    @Property()
    dni!: string;

    @ManyToOne(() => ObraSocial, { fieldName: "idObra", nullable: true })
    obraSocial?: ObraSocial | null;


}