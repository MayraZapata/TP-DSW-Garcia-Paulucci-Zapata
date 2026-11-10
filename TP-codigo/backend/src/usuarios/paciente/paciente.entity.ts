import { Entity, PrimaryKey, Property, ManyToOne, OneToOne, Cascade } from "@mikro-orm/core";

import { ObraSocial } from "../obraSocial/obraSocial.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity()
export class Paciente {

    @PrimaryKey({ fieldName: "idPaciente" })
    idPaciente?: number;

    //al guardar/borrar el paciente, también su Usuario.
    @OneToOne(() => Usuario, {
        fieldName: "idUsuario", owner: true, eager: true,
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
    })
    usuario!: Usuario;

    @Property()
    nombre!: string;

    @Property()
    apellido!: string;

    @Property()
    dni!: string;

    @ManyToOne(() => ObraSocial, { fieldName: "idObra", nullable: true })
    obraSocial?: ObraSocial | null;
}