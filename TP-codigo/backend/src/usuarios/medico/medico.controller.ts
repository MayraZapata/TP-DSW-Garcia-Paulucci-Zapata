import { Request, Response } from "express";
import * as medicoService from "./medico.service.js";

//get all
export async function findAll(req: Request, res: Response) {
    res.json(await medicoService.listar());
}

//get one
export async function findOne(req: Request, res: Response) {
    res.json(await medicoService.obtener(Number(req.params.id)));
}

//get by especialidad
export async function findByEspecialidad(req: Request, res: Response) {
    res.json(await medicoService.listarPorEspecialidad(Number(req.params.idEspecialidad)));
}

//add
export async function add(req: Request, res: Response) {
    const medico = await medicoService.crear(req.body);
    res.status(201).json(medico);
}


//update
export async function update(req: Request, res: Response) {
    res.json(await medicoService.actualizar(Number(req.params.id), req.body));
}


//delete
export async function remove(req: Request, res: Response) {
    await medicoService.eliminar(Number(req.params.id));
    res.sendStatus(204);
}