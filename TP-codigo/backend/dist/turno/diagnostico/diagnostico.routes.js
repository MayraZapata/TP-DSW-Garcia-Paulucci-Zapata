import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./diagnostico.controller.js";
// Router exclusivo de Diagnostico. Se monta en app.ts con un prefijo,
// por ejemplo: app.use("/api/diagnosticos", diagnosticoRouter);
export const diagnosticoRouter = Router();
diagnosticoRouter.get("/", findAll);
diagnosticoRouter.get("/:id", findOne);
diagnosticoRouter.post("/", add);
diagnosticoRouter.put("/:id", update);
diagnosticoRouter.delete("/:id", remove);
//# sourceMappingURL=diagnostico.routes.js.map