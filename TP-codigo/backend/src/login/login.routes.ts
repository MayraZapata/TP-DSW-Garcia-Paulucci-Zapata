import { Router } from "express";
import { login, me, logout, cambiarPassword } from "./login.controller.js";
import { autenticar } from "../shared/auth.middleware.js";

export const loginRouter = Router();

loginRouter.post("/", login);
loginRouter.get("/me", autenticar, me);
loginRouter.post("/logout", logout);
loginRouter.post("/cambiar-password", autenticar, cambiarPassword);