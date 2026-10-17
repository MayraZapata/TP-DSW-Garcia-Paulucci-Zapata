import { Router } from "express";
import { findAll, findOne, add, update, remove, buscarPorDni, altaPorGuardia } from "./paciente.controller.js";
import { autenticar, autorizar, soloPropio } from "../../shared/auth.middleware.js";

export const pacienteRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];
const adminOPropio = [autenticar, autorizar("ADMIN", "PACIENTE"), soloPropio("PACIENTE", "id")];

pacienteRouter.get("/", soloAdmin, findAll);
pacienteRouter.get("/dni/:dni", soloAdmin, buscarPorDni); // guardia: ¿existe el paciente con este DNI?
pacienteRouter.get("/:id", adminOPropio, findOne);
pacienteRouter.post("/guardia", soloAdmin, altaPorGuardia); // guardia: alta de paciente nuevo (cuenta = DNI)
pacienteRouter.post("/", add); // público: es el registro
pacienteRouter.put("/:id", adminOPropio, update);
pacienteRouter.delete("/:id", soloAdmin, remove);