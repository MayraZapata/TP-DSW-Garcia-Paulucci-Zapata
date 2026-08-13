import { Request, Response } from "express";
import { orm } from "../../../shared/orm.js";
import { Especialidad } from "./especialidad.entity.js";

const em = orm.em;

//GETALL
//Equivalente - SELECT * FROM especialidad;
export async function findAll(req: Request, res: Response) {
    const especialidades = await em.find(Especialidad,{});
    res.json(especialidades);
}


//GETONE
//Equivalente - SELECT * FROM especialidad WHERE idEspecialidad = ?
export async function findOne(req: Request, res: Response){
    const especialidad = await em.findOne( Especialidad, { idEspecialidad: Number(req.params.id) });

    if (!especialidad) {
        return res.status(404).json({message: "Especialidad inexistente" });
    }

    res.json(especialidad);

}


//ADD
//Crear y guardar una nueva especialidad en la base de datos
export async function add( req: Request, res: Response) {

    const nombreEspecialidad = req.body.nombreEspecialidad?.trim();

    // Evitar cargar dos veces la misma especialidad por nombre
    const existente = await em.findOne(Especialidad, { nombreEspecialidad });
    if (existente) {
        return res.status(400).json({ message: "Ya existe una especialidad con ese nombre" });
    }

    const especialidad = em.create(Especialidad, { ...req.body, nombreEspecialidad });
    await em.persistAndFlush(especialidad);

    res.status(201).json(especialidad);
}


//UPDATE
//Actualizar una especialidad existente en la base de datos
export async function update(req: Request, res: Response) {

    const especialidad = await em.findOne(Especialidad, { idEspecialidad: Number(req.params.id) });
    if (!especialidad)
        return res.status(404).json({message: "Especialidad inexistente" });

    // Si se está cambiando el nombre, chequear que no choque con otra especialidad ya cargada
    if (req.body.nombreEspecialidad) {
        const nombreEspecialidad = req.body.nombreEspecialidad.trim();
        const existente = await em.findOne(Especialidad, { nombreEspecialidad });
        if (existente && existente.idEspecialidad !== especialidad.idEspecialidad) {
            return res.status(400).json({ message: "Ya existe otra especialidad con ese nombre" });
        }
        req.body.nombreEspecialidad = nombreEspecialidad;
    }

    em.assign(especialidad, req.body);

    await em.flush();

    res.json(especialidad);

}



//DELETE
//Eliminar una especialidad existente en la base de datos
export async function remove( req: Request,res: Response) {

    const especialidad = await em.findOne(Especialidad, {idEspecialidad: Number(req.params.id)});

    if (!especialidad)
        return res.status(404).json({message: "Especialidad inexistente" });

    await em.removeAndFlush(especialidad);

    res.status(204).json({message: "Especialidad eliminada" });

}