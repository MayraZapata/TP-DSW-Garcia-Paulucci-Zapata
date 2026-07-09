import { Router } from "express";

import { findAll, findOne, add, update, remove } from "./especialidad.controller.js";

export const especialidadRouter = Router();

especialidadRouter.get("/", findAll);

especialidadRouter.get("/:id",findOne);

especialidadRouter.post("/",add);

especialidadRouter.put("/:id",update);

especialidadRouter.delete("/:id",remove);