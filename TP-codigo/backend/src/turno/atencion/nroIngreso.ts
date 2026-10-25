import { EntityManager } from "@mikro-orm/core";

import { Consulta } from "../consulta/Consulta.entity.js";
import { Urgencia } from "../urgencia/Urgencia.entity.js";

// Número de ingreso de una atención (consulta o urgencia): 6 cifras al azar que NO se repiten.
// Se busca uno libre en toda la tabla `atencion` (consultas y urgencias comparten la columna).
// Si dos pedidos eligieran el mismo número exactamente a la vez, el índice único
// uq_atencion_nroIngreso de la base rechaza al segundo: es la red de seguridad.
export async function generarNroIngreso(em: EntityManager): Promise<number> {
    for (let intento = 0; intento < 10; intento++) {
        const nro = Math.floor(100000 + Math.random() * 900000);
        const usados = (await em.count(Consulta, { nroIngreso: nro })) + (await em.count(Urgencia, { nroIngreso: nro }));
        if (usados === 0) return nro;
    }
    throw new Error("No se pudo generar un número de ingreso libre");
}
