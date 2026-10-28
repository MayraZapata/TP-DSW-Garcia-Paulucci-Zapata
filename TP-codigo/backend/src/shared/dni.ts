import { EntityManager } from "@mikro-orm/core";
import { Paciente } from "../usuarios/paciente/paciente.entity.js";

// El DNI tiene que ser ÚNICO por paciente, sin importar cómo lo escriban:
// "47.076.568", "47076568" y " 47 076 568 " son el mismo DNI.
// Por eso TODOS los caminos (registro público, edición y guardia) pasan por acá
// y en la base se guarda siempre la forma "limpia" (solo dígitos).

// Saca puntos y espacios (de cualquier tipo: espacios, tabs, saltos de línea).
export function normalizarDni(valor: unknown): string {
    return String(valor ?? "").replace(/[.\s]/g, "");
}

// Devuelve el mensaje de error si el DNI (ya normalizado) no sirve, o null si está bien.
export function validarDni(dni: string): string | null {
    if (!dni) return "El DNI es obligatorio";
    if (!/^\d{6,10}$/.test(dni)) return "El DNI debe tener entre 6 y 10 números (se ignoran puntos y espacios)";
    return null;
}

// Busca un paciente por DNI. Normaliza igual que al guardar, así que "47.076.568" encuentra al "47076568".
export function buscarPacientePorDni(em: EntityManager, dni: unknown) {
    return em.findOne(Paciente, { dni: normalizarDni(dni) }, { populate: ["obraSocial"] });
}

// ¿El error que devolvió la base es por el índice único del DNI?
// (Es la red de seguridad cuando dos pedidos intentan crear el mismo DNI exactamente a la vez.)
export function esErrorDniDuplicado(error: unknown): boolean {
    const mensaje = String((error as { message?: string })?.message ?? "");
    return (error as { code?: string })?.code === "ER_DUP_ENTRY" && mensaje.includes("uq_paciente_dni");
}
