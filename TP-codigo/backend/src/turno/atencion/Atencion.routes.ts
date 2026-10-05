import { Router } from "express";
import {
  findAll,
  add,
  findByPaciente,
  findByMedico,
  cancelarTurno,
  cambiarEstado,
  buscarTurnos,
  completarAtencion
} from "./Atencion.controller.js";
import { autenticar, autorizar, soloPropio } from "../../shared/auth.middleware.js";

export const atencionRouter = Router();

const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];

atencionRouter.get("/", adminOMedico, findAll);
atencionRouter.post("/", [autenticar, autorizar("ADMIN", "PACIENTE")], add);
atencionRouter.get("/paciente/:idPaciente",[autenticar, autorizar("ADMIN", "MEDICO", "PACIENTE"), soloPropio("PACIENTE", "idPaciente")],findByPaciente);
atencionRouter.get("/medico/:matricula",[autenticar, autorizar("ADMIN", "MEDICO"), soloPropio("MEDICO", "matricula")],findByMedico);
atencionRouter.patch("/:idAtencion/cancelar", [autenticar, autorizar("PACIENTE")], cancelarTurno);
atencionRouter.patch("/:idAtencion/estado", adminOMedico, cambiarEstado);
atencionRouter.patch("/:idAtencion/diagnostico", adminOMedico, completarAtencion);
atencionRouter.get("/buscar", adminOMedico, buscarTurnos);