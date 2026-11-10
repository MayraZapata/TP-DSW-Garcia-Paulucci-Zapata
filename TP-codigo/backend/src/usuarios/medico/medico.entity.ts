import { Entity, PrimaryKey, Property, ManyToOne, OneToOne, Cascade } from "@mikro-orm/core";

import { Especialidad } from "../especialidad/especialidad.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity()
export class Medico {

    @PrimaryKey()
    matricula!: number;

    @OneToOne(() => Usuario, {
        fieldName: "idUsuario", owner: true, eager: true,
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
    })
    usuario!: Usuario;

    @Property()
    nombre!: string;

    @Property()
    apellido!: string;

    @ManyToOne(() => Especialidad, { fieldName: "idEspecialidad" })
    especialidad!: Especialidad;
}