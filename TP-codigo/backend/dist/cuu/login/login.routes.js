import { Router } from "express";
import { login } from "./login.controller.js";
export const loginRouter = Router();
loginRouter.post("/", login);
//# sourceMappingURL=login.routes.js.map