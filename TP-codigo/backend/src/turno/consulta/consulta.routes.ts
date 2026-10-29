import { Router } from "express";
import {
  findAll,
  add,
  findByPaciente,
  findByMedico,
  cancelarTurno,
  cambiarEstado,
  buscarTurnos,
  completarAtencion,
  getHorariosOcupados,
  historialPorPaciente,
  historialPorDni
} from "./consulta.controller.js";
import { autenticar, autorizar, soloPropio } from "../../shared/auth.middleware.js";

export const consultaRouter = Router();

const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];

consultaRouter.get("/", adminOMedico, findAll);
consultaRouter.post("/", [autenticar, autorizar("ADMIN", "PACIENTE")], add);
consultaRouter.get("/horarios-ocupados", [autenticar, autorizar("ADMIN", "PACIENTE")], getHorariosOcupados);
consultaRouter.get("/paciente/:idPaciente", [autenticar, autorizar("ADMIN", "MEDICO", "PACIENTE"), soloPropio("PACIENTE", "idPaciente")], findByPaciente);
consultaRouter.get("/medico/:matricula", [autenticar, autorizar("ADMIN", "MEDICO"), soloPropio("MEDICO", "matricula")], findByMedico);
consultaRouter.patch("/:idAtencion/cancelar", [autenticar, autorizar("PACIENTE")], cancelarTurno);
consultaRouter.patch("/:idAtencion/estado", adminOMedico, cambiarEstado);
consultaRouter.patch("/:idAtencion/diagnostico", adminOMedico, completarAtencion);
consultaRouter.get("/buscar", adminOMedico, buscarTurnos);
consultaRouter.get("/historial/paciente/:idPaciente", [autenticar, autorizar("ADMIN", "MEDICO", "PACIENTE"), soloPropio("PACIENTE", "idPaciente")], historialPorPaciente);
consultaRouter.get("/historial/dni/:dni", adminOMedico, historialPorDni);