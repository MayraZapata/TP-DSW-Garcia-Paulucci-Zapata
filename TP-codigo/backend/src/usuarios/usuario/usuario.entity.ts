import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import type { Rol } from "../../shared/jwt.js";


@Entity()
export class Usuario {

    @PrimaryKey({ fieldName: "idUsuario" })
    idUsuario?: number;

    @Property({ fieldName: "nombreUsuario", unique: true })
    nombreUsuario!: string;

    @Property({ hidden: true })
    password!: string;

    @Property({ type: "string" })
    rol!: Rol;
}