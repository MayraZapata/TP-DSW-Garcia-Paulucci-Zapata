import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./obraSocial.controller.js";
import { autenticar, autorizar } from "../../../shared/auth.middleware.js";

export const obraSocialRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];

obraSocialRouter.get("/", findAll);
obraSocialRouter.get("/:id", findOne);
obraSocialRouter.post("/", soloAdmin, add);
obraSocialRouter.put("/:id", soloAdmin, update);
obraSocialRouter.delete("/:id", soloAdmin, remove);