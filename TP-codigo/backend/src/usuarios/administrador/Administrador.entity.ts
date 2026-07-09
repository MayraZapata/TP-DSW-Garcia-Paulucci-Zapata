import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Usuario } from "../usuario.abstract.js";


@Entity()
export class Administrador extends Usuario {

    @PrimaryKey({ fieldName: "idAdministrador" })
    idAdministrador!: number;

}