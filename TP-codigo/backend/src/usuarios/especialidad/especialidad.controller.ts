import { Request, Response } from "express";
import * as especialidadService from "./especialidad.service.js";

//GETALL
export async function findAll(req: Request, res: Response) {
    res.json(await especialidadService.listar());
}

//GETONE
export async function findOne(req: Request, res: Response) {
    res.json(await especialidadService.obtener(Number(req.params.id)));
}

//ADD
export async function add(req: Request, res: Response) {
    const especialidad = await especialidadService.crear(req.body);
    res.status(201).json(especialidad);
}

//UPDATE
export async function update(req: Request, res: Response) {
    res.json(await especialidadService.actualizar(Number(req.params.id), req.body));
}

//DELETE
export async function remove(req: Request, res: Response) {
    await especialidadService.eliminar(Number(req.params.id));
    res.sendStatus(204);
}