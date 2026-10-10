import open from "open";
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const URL_BASE = `http://localhost:${PORT}`;

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