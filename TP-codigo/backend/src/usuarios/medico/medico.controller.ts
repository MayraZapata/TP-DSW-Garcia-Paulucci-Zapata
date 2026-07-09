import { Request, Response } from "express";
import { orm } from "../../shared/orm.js";

import { Medico } from "./medico.entity.js";
import { Especialidad } from "../cualidadesUsr/especialidad/especialidad.entity.js";
import { existeUsuario } from "../existeUsuario.js";

const em = orm.em;

export async function findAll(req: Request, res: Response) {

    const medicos = await em.find(Medico, {}, { populate: ["especialidad"] } );
    res.json(medicos);

}

export async function findOne(req: Request, res: Response) {

    const medico = await em.findOne(Medico, 
        {matricula: Number(req.params.id)}, 
        { populate: ["especialidad"] } 
    );

    if (!medico)
        return res.sendStatus(404);

    res.json(medico);
}

export async function add(req: Request, res: Response) {

    const medicoExistente = await em.findOne(Medico, { matricula: Number(req.body.matricula) });
    

    if (medicoExistente) {
        return res.status(400).json({ message: "La matrícula ya existe"});
    }


    if (await existeUsuario(req.body.nombreUsuario)) {
            return res.status(400).json({ message: "El nombre de usuario ya existe"});
    }

    let especialidad = null;
    if (req.body.idEspecialidad) {
        especialidad = await em.findOne( Especialidad, { idEspecialidad: Number(req.body.idEspecialidad) });
        
        if (!especialidad) {
            return res.status(404).json({ message: "Especialidad inexistente"});
        }
    }
    
    const medico = em.create( Medico,
            {
                matricula: req.body.matricula,
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                nombreUsuario: req.body.nombreUsuario,
                password: req.body.password,
                especialidad
            }
        );

    await em.persistAndFlush(medico);

    res.status(201).json(medico);

}

export async function update(req: Request, res: Response) {

    const medico = await em.findOne( Medico,{ matricula: Number(req.params.id) } );

    if (!medico)
        return res.sendStatus(404);

    em.assign(medico, req.body);

    if (req.body.idEspecialidad) {

        const especialidad = await em.findOne(Especialidad,{idEspecialidad: req.body.idEspecialidad});

        if (especialidad)
            medico.especialidad = especialidad;

    }

    await em.flush();

    res.json(medico);

}

export async function remove(req: Request, res: Response) {

    const medico =
        await em.findOne(Medico, {matricula:Number(req.params.id)} );

    if (!medico)
        return res.sendStatus(404);

    await em.removeAndFlush(medico);

    res.sendStatus(204);

}