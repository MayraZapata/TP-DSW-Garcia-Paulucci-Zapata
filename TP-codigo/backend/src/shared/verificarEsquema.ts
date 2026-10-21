import { orm } from "./orm.js";

// El módulo de Guardia/Urgencias necesita columnas nuevas en la base (las agrega database/migracion_guardia.sql).
// Si el backend arranca con el código nuevo ANTES de correr ese script, las pantallas de turnos fallarían una por
// una con "Unknown column ...". Por eso se revisa al arrancar y, si falta algo, se frena con un mensaje claro.
const COLUMNAS_ESPERADAS = 4;   // atencion.tipoAtencion, atencion.motivo, atencion.prioridad, especialidad.atiendeGuardia

export async function verificarEsquema() {
    try {
        const filas = await orm.em.getConnection().execute(
            `SELECT table_name, column_name FROM information_schema.columns
              WHERE table_schema = DATABASE()
                AND ((table_name = 'atencion' AND column_name IN ('tipoAtencion', 'motivo', 'prioridad'))
                  OR (table_name = 'especialidad' AND column_name = 'atiendeGuardia'))`
        );

        if (filas.length < COLUMNAS_ESPERADAS) {
            console.error("\n❌ La base de datos todavía NO tiene los cambios del módulo de Guardia/Urgencias.");
            console.error("   Corré primero, como root:  mysql -u root -p --default-character-set=utf8mb4 < database/migracion_guardia.sql");
            console.error("   (o recargá la base con database/gestion_turnos.sql) y después volvé a arrancar el backend.\n");
            process.exit(1);
        }
    } catch (error: any) {
        // Si no se puede consultar el esquema, no se frena el servidor: solo se avisa
        console.warn("No se pudo verificar el esquema de la base:", error.message);
    }
}
