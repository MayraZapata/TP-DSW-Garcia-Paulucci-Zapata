import { Router } from "express";
import { findAll, add, findByPaciente, findByMedico, cancelarTurno, cambiarEstado } from "./Atencion.controller.js";
export const atencionRouter = Router();
atencionRouter.get("/", findAll);
atencionRouter.post("/", add);
atencionRouter.get("/paciente/:idPaciente", findByPaciente);
atencionRouter.get("/medico/:matricula", findByMedico);
atencionRouter.patch("/:idAtencion/cancelar", cancelarTurno);
atencionRouter.patch("/:idAtencion/estado", cambiarEstado);
//# sourceMappingURL=Atencion.routes.js.map