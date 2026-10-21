import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Especialidad {

    @PrimaryKey({ fieldName: "idEspecialidad" })
    idEspecialidad!: number;

    @Property({ fieldName: "nombreEspecialidad" })
    nombreEspecialidad!: string;

    @Property({ nullable: true })
    descripcion?: string;

    // ¿Los médicos de esta especialidad pueden atender la guardia (urgencias)?
    // Es un dato, no código: para habilitar otra especialidad alcanza con ponerlo en true
    // (desde "Gestión de Especialidades" o con un UPDATE en la base).
    @Property({ fieldName: "atiendeGuardia", default: false })
    atiendeGuardia: boolean = false;

}