
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Diagnostico {

    @PrimaryKey({ fieldName: "idDiagnostico" })
    idDiagnostico!: number;

    @Property({ fieldName: "nombreDiagnostico" })
    nombreDiagnostico!: string;

    @Property({ nullable: true })
    tratamiento?: string;

}