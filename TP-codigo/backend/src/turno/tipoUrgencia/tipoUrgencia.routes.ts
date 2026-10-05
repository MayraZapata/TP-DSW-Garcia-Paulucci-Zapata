import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./tipoUrgencia.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const tipoUrgenciaRouter = Router();

tipoUrgenciaRouter.use(autenticar, autorizar("ADMIN"));

tipoUrgenciaRouter.get("/", findAll);
tipoUrgenciaRouter.get("/:id", findOne);
tipoUrgenciaRouter.post("/", add);
tipoUrgenciaRouter.put("/:id", update);
tipoUrgenciaRouter.delete("/:id", remove);