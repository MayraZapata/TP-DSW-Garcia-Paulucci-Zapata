import { Request, Response } from "express";
import * as obraSocialService from "./obraSocial.service.js";

//GETALL
export async function findAll(req: Request, res: Response) {
    res.json(await obraSocialService.listar());
}

//GETONE
export async function findOne(req: Request, res: Response) {
    res.json(await obraSocialService.obtener(Number(req.params.id)));
}

//ADD
export async function add(req: Request, res: Response) {
    const obraSocial = await obraSocialService.crear(req.body);
    res.status(201).json(obraSocial);
}

//UPDATE
export async function update(req: Request, res: Response) {
    res.json(await obraSocialService.actualizar(Number(req.params.id), req.body));
}

//DELETE
export async function remove(req: Request, res: Response) {
    await obraSocialService.eliminar(Number(req.params.id));
    res.sendStatus(204);
}