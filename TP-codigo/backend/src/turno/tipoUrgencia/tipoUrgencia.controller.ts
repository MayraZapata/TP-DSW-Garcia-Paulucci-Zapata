import { Request, Response } from "express";
import * as tipoUrgenciaService from "./tipoUrgencia.service.js";

// TipoUrgencia no tiene relaciones propias: es Urgencia la que la referencia.
// Las reglas (nombre único, no borrar si está en uso) viven en tipoUrgencia.service.

//GETALL
export async function findAll(req: Request, res: Response) {
    res.json(await tipoUrgenciaService.listar());
}

//GETONE
export async function findOne(req: Request, res: Response) {
    res.json(await tipoUrgenciaService.obtener(Number(req.params.id)));
}

//ADD
export async function add(req: Request, res: Response) {
    const tipoUrgencia = await tipoUrgenciaService.crear(req.body);
    res.status(201).json(tipoUrgencia);
}

//UPDATE
export async function update(req: Request, res: Response) {
    res.json(await tipoUrgenciaService.actualizar(Number(req.params.id), req.body));
}

//DELETE
export async function remove(req: Request, res: Response) {
    await tipoUrgenciaService.eliminar(Number(req.params.id));
    res.sendStatus(204);
}
