import { Router } from "express";
import { activas, findAll, findOne, add, update, remove, tomar, finalizar, cancelar } from "./urgencia.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const urgenciaRouter = Router();

// Roles: no hay recepcionista -> el ADMIN registra los ingresos; el MÉDICO atiende y finaliza.
const soloAdmin = [autenticar, autorizar("ADMIN")];
const soloMedico = [autenticar, autorizar("MEDICO")];
const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];

// OJO con el orden: "/activas" va ANTES de "/:id" (si no, "activas" se tomaría como un id)
urgenciaRouter.get("/activas", adminOMedico, activas);
urgenciaRouter.get("/", adminOMedico, findAll);
urgenciaRouter.get("/:id", adminOMedico, findOne);
urgenciaRouter.post("/", soloAdmin, add);
urgenciaRouter.put("/:id", soloAdmin, update);
urgenciaRouter.delete("/:id", soloAdmin, remove);

urgenciaRouter.patch("/:id/tomar", soloMedico, tomar);
urgenciaRouter.patch("/:id/finalizar", soloMedico, finalizar);
urgenciaRouter.patch("/:id/cancelar", adminOMedico, cancelar);
