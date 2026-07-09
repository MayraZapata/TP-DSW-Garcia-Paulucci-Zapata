
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Diagnostico {

    @PrimaryKey()
    idDiagnostico!: number;

    @Property()
    nombreDiagnostico!: string;

    @Property({ nullable: true })
    tratamiento?: string;

}