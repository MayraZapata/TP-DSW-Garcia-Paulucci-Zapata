import { Router } from "express";

import { findAll, findOne, add, update, remove } from "./obraSocial.controller.js";

export const obraSocialRouter = Router();

obraSocialRouter.get("/", findAll);

obraSocialRouter.get("/:id",findOne);

obraSocialRouter.post("/",add);

obraSocialRouter.put("/:id",update);

obraSocialRouter.delete("/:id",remove);