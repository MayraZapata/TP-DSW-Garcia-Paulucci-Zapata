import open from "open";
import app from "./app.js";
import { verificarEsquema } from "./shared/verificarEsquema.js";

const PORT = Number(process.env.PORT ?? 3000);
const URL_BASE = `http://localhost:${PORT}`;

// Antes de aceptar pedidos: la base tiene que tener los cambios de migracion_guardia.sql
await verificarEsquema();

app.listen(PORT, () => {

    console.log(`Servidor corriendo en ${URL_BASE}/`);
    console.log(`Documentación Swagger en ${URL_BASE}/api/docs`);

    // Solo abre el navegador si el .env lo pide (nunca en producción)
    if (process.env.OPEN_BROWSER === "true") {
        // .catch: si no hay navegador disponible, que no se caiga el servidor
        open(URL_BASE).catch(() => {});
        open(`${URL_BASE}/api/docs`).catch(() => {});
    }

});