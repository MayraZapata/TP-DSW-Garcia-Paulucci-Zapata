/*
 * Reglas de la guardia, en funciones PURAS (sin base de datos ni Express):
 * así se pueden probar solas y el controller queda corto y legible.
 */

// ---------- Prioridad (la elige una persona al ingresar al paciente) ----------
export const PRIORIDADES = ["rojo", "amarillo", "verde"] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

// Cuanto MENOR el número, antes se atiende: rojo (inmediata) < amarillo (intermedia) < verde (puede esperar)
export const ORDEN_PRIORIDAD: Record<Prioridad, number> = { rojo: 1, amarillo: 2, verde: 3 };

export function esPrioridad(valor: unknown): valor is Prioridad {
    return typeof valor === "string" && (PRIORIDADES as readonly string[]).includes(valor);
}

// ---------- Estados de una urgencia ----------
export const ESTADO = {
    EN_ESPERA: "en_espera",
    EN_ATENCION: "en_atencion",
    FINALIZADA: "finalizada",
    CANCELADA: "cancelada",
} as const;
export type EstadoUrgencia = (typeof ESTADO)[keyof typeof ESTADO];

// "Activas" = las que todavía están en juego (siguen en la pantalla de guardia)
export const ESTADOS_ACTIVOS: EstadoUrgencia[] = [ESTADO.EN_ESPERA, ESTADO.EN_ATENCION];

// ---------- Orden de la lista de espera ----------
export interface ItemDeCola {
    idAtencion: number;
    prioridad: string;
    fechaAtencion: Date;   // fecha de llegada (la pone el servidor)
    horaAtencion: string;  // hora de llegada "HH:MM:SS" (la pone el servidor)
}

/*
 * Compara dos urgencias para la lista de espera:
 *   1º por prioridad (rojo, amarillo, verde)
 *   2º dentro de la misma prioridad, por hora de llegada (la más antigua primero)
 *   3º si llegaron en el mismo segundo, por idAtencion (es autoincremental: respeta el orden real de carga)
 */
export function compararParaLaCola(a: ItemDeCola, b: ItemDeCola): number {
    const pa = ORDEN_PRIORIDAD[a.prioridad as Prioridad] ?? 99;
    const pb = ORDEN_PRIORIDAD[b.prioridad as Prioridad] ?? 99;
    if (pa !== pb) return pa - pb;

    const fa = a.fechaAtencion.getTime();
    const fb = b.fechaAtencion.getTime();
    if (fa !== fb) return fa - fb;

    if (a.horaAtencion !== b.horaAtencion) return a.horaAtencion < b.horaAtencion ? -1 : 1;

    return a.idAtencion - b.idAtencion;
}

// Devuelve una copia ordenada (no modifica la lista original)
export function ordenarListaEspera<T extends ItemDeCola>(lista: readonly T[]): T[] {
    return [...lista].sort(compararParaLaCola);
}

// ---------- Fecha y hora de llegada (las pone SIEMPRE el servidor) ----------
const dos = (n: number) => String(n).padStart(2, "0");

export function fechaYHoraDeLlegada(ahora: Date = new Date()): { fecha: Date; hora: string } {
    return {
        // medianoche local de hoy: igual criterio que usa la reserva de turnos (`${fecha}T00:00:00`)
        fecha: new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()),
        hora: `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}`,
    };
}

// Minutos transcurridos desde la llegada hasta `ahora` (nunca negativo)
export function minutosDesdeLlegada(fecha: Date, hora: string, ahora: Date = new Date()): number {
    const [h, m, s] = hora.split(":").map(Number);
    const llegada = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), h || 0, m || 0, s || 0);
    return Math.max(0, Math.floor((ahora.getTime() - llegada.getTime()) / 60000));
}

// ---------- Errores "esperables" (reglas de negocio) ----------
// El controller los convierte en una respuesta JSON con el código HTTP que corresponda.
export class ErrorNegocio extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}
