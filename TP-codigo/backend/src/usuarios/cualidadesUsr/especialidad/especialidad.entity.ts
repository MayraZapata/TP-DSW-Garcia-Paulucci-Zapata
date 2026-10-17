import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Especialidad {

    @PrimaryKey({ fieldName: "idEspecialidad" })
    idEspecialidad!: number;

    @Property({ fieldName: "nombreEspecialidad" })
    nombreEspecialidad!: string;

    @Property({ nullable: true })
    descripcion?: string;

    // true = los médicos de esta especialidad pueden atender la guardia (urgencias).
    // Se cambia desde "Gestión de Especialidades": habilitar otra especialidad
    // es solo tildar esta opción, sin tocar el código.
    @Property({ fieldName: "atiendeUrgencias", default: false })
    atiendeUrgencias: boolean = false;

}