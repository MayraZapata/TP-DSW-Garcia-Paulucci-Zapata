import { Property } from "@mikro-orm/core";

export abstract class Usuario {

    @Property({ fieldName: "nombreUsuario", unique: true })
    nombreUsuario!: string;
    

    @Property({ hidden: true })
    password!: string;

}