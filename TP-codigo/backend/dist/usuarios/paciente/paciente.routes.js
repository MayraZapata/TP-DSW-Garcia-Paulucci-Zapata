import { Router } from "express";
import { findAll, findOne, add, update, remove, } from "./paciente.controller.js";
export const pacienteRouter = Router();
pacienteRouter.get("/", findAll);
pacienteRouter.get("/:id", findOne);
pacienteRouter.post("/", add);
pacienteRouter.put("/:id", update);
pacienteRouter.delete("/:id", remove);
//# sourceMappingURL=paciente.routes.js.map