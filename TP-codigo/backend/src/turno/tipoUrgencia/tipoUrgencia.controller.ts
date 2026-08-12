import { Request, Response } from "express";
import { orm } from "../../shared/orm.js";
import { TipoUrgencia } from "./tipoUrgencia.entity.js";

const em = orm.em;

// Al igual que Diagnostico, TipoUrgencia no tiene relaciones propias:
// es Atencion la que la referencia opcionalmente. CRUD directo, sin FKs que resolver.

//GETALL
//Equivalente - SELECT * FROM TipoUrgencia;
export async function findAll(req: Request, res: Response) {
    const tiposUrgencia = await em.find(TipoUrgencia, {});
    res.json(tiposUrgencia);
}


//GETONE
//Equivalente - SELECT * FROM TipoUrgencia WHERE idTipo = ?
export async function findOne(req: Request, res: Response) {
    const tipoUrgencia = await em.findOne(TipoUrgencia, { idTipo: Number(req.params.id) });

    if (!tipoUrgencia) {
        return res.status(404).json({ message: "Tipo de Urgencia inexistente" });
    }

    res.json(tipoUrgencia);

}


//ADD
//Crear y guardar un nuevo tipo de urgencia en la base de datos
export async function add(req: Request, res: Response) {
    const tipoUrgencia = em.create(TipoUrgencia, req.body);
    await em.persistAndFlush(tipoUrgencia);

    res.status(201).json(tipoUrgencia);
}


//UPDATE
//Actualizar un tipo de urgencia existente en la base de datos
export async function update(req: Request, res: Response) {

    const tipoUrgencia = await em.findOne(TipoUrgencia, { idTipo: Number(req.params.id) });
    if (!tipoUrgencia)
        return res.status(404).json({ message: "Tipo de Urgencia inexistente" });

    em.assign(tipoUrgencia, req.body);

    await em.flush();

    res.json(tipoUrgencia);

}



//DELETE
//Eliminar un tipo de urgencia existente en la base de datos
export async function remove(req: Request, res: Response) {

    const tipoUrgencia = await em.findOne(TipoUrgencia, { idTipo: Number(req.params.id) });

    if (!tipoUrgencia)
        return res.status(404).json({ message: "Tipo de Urgencia inexistente" });

    await em.removeAndFlush(tipoUrgencia);

    res.status(204).json({ message: "Tipo de Urgencia eliminado" });

}