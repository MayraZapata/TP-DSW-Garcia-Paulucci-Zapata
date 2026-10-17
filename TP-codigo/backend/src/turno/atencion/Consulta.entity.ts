import { Entity } from "@mikro-orm/core";

import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Atencion } from "./Atencion.entity.js";

/*
 * Consulta = atención por TURNO (reservado por el paciente o por el admin).
 * Sus estados son los de siempre: pendiente, atendido, ausente, cancelado.
 *
 * Todas las pantallas de turnos (reservar, agenda, mis turnos, reportes)
 * trabajan con esta clase, no con Atencion, y por eso nunca ven urgencias:
 * MikroORM agrega solo "WHERE tipoAtencion = 'consulta'" a cada búsqueda.
 */
@Entity({ discriminatorValue: "consulta" })
export class Consulta extends Atencion {

    // Una consulta SIEMPRE tiene médico. `declare` solo afina el tipo de TypeScript
    // (no crea otra columna ni otra propiedad: sigue siendo la de Atencion).
    declare medico: Medico;

    constructor() {
        super();
        this.tipoAtencion = "consulta";
    }

}
