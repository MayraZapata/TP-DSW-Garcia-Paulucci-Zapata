import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "TipoUrgencia" })
export class TipoUrgencia {

    @PrimaryKey({ fieldName: "idTipo" })
    idTipo!: number;

    @Property()
    nombre!: string;

    @Property({fieldName: "descripcionTipo", nullable: true })
    descripcionTipo?: string;

}