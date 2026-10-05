import { Router } from "express";
import { findAll, findOne, add, update, remove, findByEspecialidad } from "./medico.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const medicoRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];
const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];
const adminOPaciente = [autenticar, autorizar("ADMIN", "PACIENTE")];

medicoRouter.get("/", adminOMedico, findAll);
medicoRouter.get("/:id", adminOMedico, findOne);
medicoRouter.get("/especialidad/:idEspecialidad", adminOPaciente, findByEspecialidad);
medicoRouter.post("/", soloAdmin, add);
medicoRouter.put("/:id", soloAdmin, update);
medicoRouter.delete("/:id", soloAdmin, remove);