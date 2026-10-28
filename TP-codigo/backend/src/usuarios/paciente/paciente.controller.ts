import { Request, Response } from "express";
import * as pacienteService from "./paciente.service.js";

//get All
export async function findAll(req: Request, res: Response) {
    res.json(await pacienteService.listar());
}

//get by Dni
export async function findByDni(req: Request, res: Response) {
    res.json(await pacienteService.buscarPorDni(req.params.dni));
}

//get one
export async function findOne(req: Request, res: Response) {
    res.json(await pacienteService.obtener(Number(req.params.id)));
}

//add
export async function add(req: Request, res: Response) {
    const paciente = await pacienteService.crear(req.body);
    res.status(201).json(paciente);
}


//update
export async function update(req: Request, res: Response) {
    res.json(await pacienteService.actualizar(Number(req.params.id), req.body));
}

//delete
export async function remove(req: Request, res: Response) {
    await pacienteService.eliminar(Number(req.params.id));
    res.sendStatus(204);
}