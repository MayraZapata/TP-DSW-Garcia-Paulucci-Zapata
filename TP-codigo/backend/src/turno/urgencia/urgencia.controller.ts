import { Request, Response } from "express";
import * as urgenciaService from "./urgencia.service.js";

// Las reglas de la guardia (orden de la lista de espera, quién puede atender, cancelar, etc.)
// viven en urgencia.service. Acá solo se lee el pedido y se arma la respuesta.

//GUARDIA: lista de espera ordenada + pacientes en atención
export async function guardia(req: Request, res: Response) {
    res.json(await urgenciaService.guardia());
}

//GETALL (filtro opcional: ?estado=finalizada)
export async function findAll(req: Request, res: Response) {
    const estado = req.query.estado ? String(req.query.estado) : undefined;
    res.json(await urgenciaService.listar(estado));
}

//GETONE
export async function findOne(req: Request, res: Response) {
    res.json(await urgenciaService.obtener(Number(req.params.idAtencion)));
}

//ADD (ingreso a la guardia)
export async function add(req: Request, res: Response) {
    const { pacienteNuevo, urgencia } = await urgenciaService.crear(req.body);

    res.status(201).json({
        message: pacienteNuevo
            ? "Paciente registrado y urgencia ingresada. Su usuario y contraseña iniciales son su DNI."
            : "Urgencia ingresada",
        pacienteNuevo,
        urgencia,
    });
}

//UPDATE
export async function update(req: Request, res: Response) {
    res.json(await urgenciaService.actualizar(Number(req.params.idAtencion), req.body));
}

//ATENDER
export async function atender(req: Request, res: Response) {
    const urgencia = await urgenciaService.atender(Number(req.params.idAtencion), req.auth!.id);
    res.json({ message: "Paciente en atención", urgencia });
}

//FINALIZAR
export async function finalizar(req: Request, res: Response) {
    const urgencia = await urgenciaService.finalizar(Number(req.params.idAtencion), req.auth!.id, req.body);
    res.json({ message: "Atención finalizada", urgencia });
}

//CANCELAR
export async function cancelar(req: Request, res: Response) {
    const urgencia = await urgenciaService.cancelar(Number(req.params.idAtencion), req.auth!.rol, req.auth!.id);
    res.json({ message: "Urgencia cancelada", urgencia });
}
