import { Entity, PrimaryKey, Property, OneToMany, Collection, } from "@mikro-orm/core";


@Entity({ tableName: "ObraSocial" })
export class ObraSocial {

    @PrimaryKey({fieldName: "idObra"})
    idObra!: number;

    @Property({fieldName: "nombreObra"})
    nombreObra!: string;

    @Property()
    monto!: number;
}