import { Router } from "express";

import { findAll, findOne, add, update, remove } from "./especialidad.controller.js";
import { autenticar, autorizar } from "../../../shared/auth.middleware.js";

const soloAdmin = [autenticar, autorizar("ADMIN")];


export const especialidadRouter = Router();

especialidadRouter.get("/", findAll);

especialidadRouter.get("/:id",findOne);

especialidadRouter.post("/", soloAdmin, add);

especialidadRouter.put("/:id", soloAdmin, update);

especialidadRouter.delete("/:id", soloAdmin, remove);