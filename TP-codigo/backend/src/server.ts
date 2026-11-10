import open from "open";
import app from "./app.js";

const PORT = Number(process.env.PORT ?? 3000);
const URL_BASE = `http://localhost:${PORT}`;



app.listen(PORT, () => {

    console.log(`Servidor corriendo en ${URL_BASE}/`);
    console.log(`Documentación Swagger en ${URL_BASE}/api/docs`);

    if (process.env.OPEN_BROWSER === "true") {
        open(URL_BASE).catch(() => {});
        open(`${URL_BASE}/api/docs`).catch(() => {});
    }

});