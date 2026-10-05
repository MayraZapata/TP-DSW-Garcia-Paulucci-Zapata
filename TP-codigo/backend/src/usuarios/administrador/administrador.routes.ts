import { Router } from "express";
import { findOnlyOne } from "./administrador.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const administradorRouter = Router();

administradorRouter.get("/", autenticar, autorizar("ADMIN"), findOnlyOne);