import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./diagnostico.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const diagnosticoRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];
const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];

diagnosticoRouter.get("/", adminOMedico, findAll);
diagnosticoRouter.get("/:id", adminOMedico, findOne);
diagnosticoRouter.post("/", soloAdmin, add);
diagnosticoRouter.put("/:id", soloAdmin, update);
diagnosticoRouter.delete("/:id", soloAdmin, remove);