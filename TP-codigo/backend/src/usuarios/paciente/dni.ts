import { orm } from "../../shared/orm.js";
import { Paciente } from "./paciente.entity.js";

const em = orm.em;

/*
 * Un mismo DNI puede escribirse de varias formas: "47.076.568", "47076568",
 * " 47076568 ". Para compararlos y guardarlos se usa SIEMPRE esta versión
 * "normalizada": solo los dígitos, sin puntos ni espacios.
 */
export function normalizarDni(valor: unknown): string {
    return String(valor ?? "").replace(/[.\s]/g, "");
}

// DNI válido = entre 6 y 9 dígitos (ya normalizado)
export function dniEsValido(dniNormalizado: string): boolean {
    return /^\d{6,9}$/.test(dniNormalizado);
}

export const MENSAJE_DNI_INVALIDO = "El DNI debe tener entre 6 y 9 dígitos (los puntos y espacios se ignoran)";
export const MENSAJE_DNI_REPETIDO = "Ya existe un paciente registrado con ese DNI";

/*
 * Busca un paciente por DNI ignorando puntos y espacios TAMBIÉN en lo que ya
 * está guardado en la base (hay datos viejos como " 7915420" con espacio).
 * `excluirIdPaciente` sirve al editar: un paciente no choca consigo mismo.
 *
 * La expresión REPLACE(REPLACE(dni,'.',''),' ','') es la misma de la columna
 * `dniNormalizado` de la base (ver migracion_urgencias.sql); MySQL la
 * resuelve con el índice único de esa columna.
 */
export async function buscarPacientePorDni(dniNormalizado: string, excluirIdPaciente?: number): Promise<Paciente | null> {
    const tabla = em.getMetadata().get(Paciente.name).tableName;

    const filas = await em.getConnection().execute<{ idPaciente: number }[]>(
        `select idPaciente from \`${tabla}\`
          where replace(replace(dni, '.', ''), ' ', '') = ?
            and idPaciente <> ?
          limit 1`,
        [dniNormalizado, excluirIdPaciente ?? 0]
    );

    if (filas.length === 0) return null;
    return em.findOne(Paciente, { idPaciente: filas[0].idPaciente }, { populate: ["obraSocial"] });
}
