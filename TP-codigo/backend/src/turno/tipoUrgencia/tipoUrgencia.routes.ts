import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./tipoUrgencia.controller.js";

// Router exclusivo de TipoUrgencia. Se monta en app.ts con un prefijo,
// por ejemplo: app.use("/api/tiposUrgencia", tipoUrgenciaRouter);
export const tipoUrgenciaRouter = Router();

tipoUrgenciaRouter.get("/", findAll);

tipoUrgenciaRouter.get("/:id", findOne);

tipoUrgenciaRouter.post("/", add);

tipoUrgenciaRouter.put("/:id", update);

tipoUrgenciaRouter.delete("/:id", remove);
