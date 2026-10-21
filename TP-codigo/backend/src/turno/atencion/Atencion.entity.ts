import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";

import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";

// Atencion es la clase PADRE (abstracta) del modelo de dominio:
//   - Consulta: la atención que se hace por TURNO.
//   - Urgencia: la atención que se hace por GUARDIA.
// Las dos viven en UNA sola tabla ("atencion") y la columna `tipoAtencion`
// dice de qué clase es cada fila (herencia de tabla única).
//
// Importante: NO se pone `abstract: true` dentro de @Entity({...}). En MikroORM eso hace que
// la clase se "inlinee" en las hijas y deja de existir como entidad; acá queremos poder
// consultar `Atencion` para traer consultas Y urgencias juntas (por ej. en el Historial Clínico).
// La palabra `abstract` de TypeScript alcanza para que nadie la instancie directamente.
@Entity({
    discriminatorColumn: "tipoAtencion",
    discriminatorMap: { consulta: "Consulta", urgencia: "Urgencia" },
})
export abstract class Atencion {

    @PrimaryKey({ autoincrement: true, fieldName: 'idAtencion' })
    idAtencion!: number;

    // Columna que distingue el tipo. Se declara como propiedad con su fieldName REAL porque, si no,
    // MikroORM la nombraría en snake_case ("tipo_atencion") y la base tiene "tipoAtencion".
    // Se completa sola ('consulta' / 'urgencia') según la clase que se guarde.
    @Property({ fieldName: 'tipoAtencion', type: 'string' })
    tipoAtencion!: 'consulta' | 'urgencia';

    @Property({ fieldName: 'fechaAtencion' }) 
    fechaAtencion!: Date;

    @Property({ fieldName: 'horaAtencion' }) 
    horaAtencion!: string;

    @Property({ fieldName: 'nroIngreso' }) 
    nroIngreso!: number;

    // Los estados dependen del tipo:
    //   Consulta: pendiente / atendido / ausente / cancelado
    //   Urgencia: en_espera / en_atencion / finalizada / cancelada
    @Property({ nullable: true })
    estado?: string;

    @ManyToOne(() => Paciente, { fieldName: 'idPaciente' })
    paciente!: Paciente;

    // En la base es opcional: una urgencia en espera todavía no tiene médico.
    // La Consulta lo vuelve a declarar como obligatorio (ver Consulta.entity.ts).
    @ManyToOne(() => Medico, { nullable: true, fieldName: 'matricula' })
    medico?: Medico;

    @ManyToOne(() => Diagnostico, { nullable: true, fieldName: 'idDiagnostico' })
    diagnostico?: Diagnostico;

    // (El tipo de urgencia ya no está acá: según el modelo, TipoUrgencia clasifica a Urgencia.
    //  Pasó a Urgencia.entity.ts, y con su fieldName correcto.)

}
