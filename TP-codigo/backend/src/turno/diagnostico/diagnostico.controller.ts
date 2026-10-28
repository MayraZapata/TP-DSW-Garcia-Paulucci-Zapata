import { Request, Response } from "express";
import * as diagnosticoService from "./diagnostico.service.js";

// GETALL
export async function findAll(req: Request, res: Response) {
    res.json(await diagnosticoService.listar());
}

// GETONE
export async function findOne(req: Request, res: Response) {
    res.json(await diagnosticoService.obtener(Number(req.params.id)));
}

// ADD
export async function add(req: Request, res: Response) {
    const diagnostico = await diagnosticoService.crear(req.body);
    res.status(201).json(diagnostico);
}

// UPDATE
export async function update(req: Request, res: Response) {
    res.json(await diagnosticoService.actualizar(Number(req.params.id), req.body));
}

// DELETE
export async function remove(req: Request, res: Response) {
    await diagnosticoService.eliminar(Number(req.params.id));
    res.sendStatus(204);
}