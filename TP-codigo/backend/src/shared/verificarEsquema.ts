import { orm } from "./orm.js";

// Las urgencias usan columnas propias en la tabla atencion (herencia de tabla única). Si la base quedó cargada con una
// versión vieja de database/gestion_turnos.sql, las pantallas de turnos fallarían una por una con "Unknown column ...".
// Por eso se revisa al arrancar y, si falta algo, se frena con un mensaje claro.
const COLUMNAS_ESPERADAS = 4;   // atencion.tipoAtencion, atencion.motivo, atencion.prioridad, atencion.detalleTipo

export async function verificarEsquema() {
    try {
        const filas = await orm.em.getConnection().execute(
            `SELECT table_name, column_name FROM information_schema.columns
              WHERE table_schema = DATABASE()
                AND table_name = 'atencion'
                AND column_name IN ('tipoAtencion', 'motivo', 'prioridad', 'detalleTipo')`
        );

        if (filas.length < COLUMNAS_ESPERADAS) {
            console.error("\n❌ La base de datos no está al día: le faltan columnas de la tabla atencion.");
            console.error("   Recargala, como root, con el único script de base de datos:");
            console.error("     mysql -u root -p --default-character-set=utf8mb4 < database/gestion_turnos.sql");
            console.error("   y después volvé a arrancar el backend.\n");
            process.exit(1);
        }
    } catch (error: any) {
        // Si no se puede consultar el esquema, no se frena el servidor: solo se avisa
        console.warn("No se pudo verificar el esquema de la base:", error.message);
    }
}
