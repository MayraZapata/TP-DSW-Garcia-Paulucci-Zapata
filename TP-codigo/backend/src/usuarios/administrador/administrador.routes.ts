import { Router } from "express";

import { findOnlyOne } from "./administrador.controller.js";

export const administradorRouter = Router();

administradorRouter.get("/", findOnlyOne);
