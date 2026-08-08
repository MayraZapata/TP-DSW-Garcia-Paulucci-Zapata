import "reflect-metadata";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { RequestContext } from "@mikro-orm/core";
import { orm } from "./shared/orm.js";

import { especialidadRouter } from "./usuarios/cualidadesUsr/especialidad/especialidad.routes.js";
import { obraSocialRouter } from "./usuarios/cualidadesUsr/obraSocial/obraSocial.routes.js";
import { medicoRouter } from "./usuarios/medico/medico.routes.js";
import { pacienteRouter } from "./usuarios/paciente/paciente.routes.js";
import { administradorRouter } from "./usuarios/administrador/administrador.routes.js";
import { loginRouter } from "./cuu/login/login.routes.js";
import { atencionRouter } from "./turno/atencion/Atencion.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// Servir los archivos del frontend
app.use(
    express.static(
        path.join(__dirname, "../../frontend")
    )
);

// Crear un RequestContext para cada petición
app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
});



// Las rutas irán aquí
app.use("/api/login", loginRouter);
app.use("/api/especialidades", especialidadRouter );
app.use("/api/medicos",medicoRouter);
app.use("/api/pacientes", pacienteRouter);
app.use("/api/obrasSociales", obraSocialRouter);
app.use("/api/administradores", administradorRouter);
app.use("/api/atenciones", atencionRouter);

// Ruta no encontrada
app.use((_, res) => {
    return res.status(404).json({ message: "Recurso no encontrado" });
});

export default app;