import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Especialidad {

    @PrimaryKey({ fieldName: "idEspecialidad" })
    idEspecialidad!: number;

    @Property({ fieldName: "nombreEspecialidad" })
    nombreEspecialidad!: string;

    @Property({ nullable: true })
    descripcion?: string;

}