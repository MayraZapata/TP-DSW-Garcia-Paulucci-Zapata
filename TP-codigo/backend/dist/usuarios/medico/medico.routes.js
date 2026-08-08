import { Router } from "express";
import { findAll, findOne, add, update, remove, findByEspecialidad, } from "./medico.controller.js";
export const medicoRouter = Router();
medicoRouter.get("/", findAll);
medicoRouter.get("/:id", findOne);
medicoRouter.get("/especialidad/:idEspecialidad", findByEspecialidad);
medicoRouter.post("/", add);
medicoRouter.put("/:id", update);
medicoRouter.delete("/:id", remove);
//# sourceMappingURL=medico.routes.js.map