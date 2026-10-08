import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./paciente.controller.js";
import { autenticar, autorizar, soloPropio } from "../../shared/auth.middleware.js";

export const pacienteRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];
const adminOPropio = [autenticar, autorizar("ADMIN", "PACIENTE"), soloPropio("PACIENTE", "id")];

pacienteRouter.get("/", soloAdmin, findAll);
pacienteRouter.get("/:id", adminOPropio, findOne);
pacienteRouter.post("/", add); 
pacienteRouter.put("/:id", adminOPropio, update);
pacienteRouter.delete("/:id", soloAdmin, remove);