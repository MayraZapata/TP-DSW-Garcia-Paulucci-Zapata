import { Request, Response } from "express";
import { orm } from "../../shared/orm.js";
import { hashPassword } from "../../shared/password.js";

import { Paciente } from "./paciente.entity.js";
import { ObraSocial } from "../cualidadesUsr/obraSocial/obraSocial.entity.js";
import { existeUsuario } from "../existeUsuario.js";

const em = orm.em;

export async function findAll(req: Request, res: Response) {

    const pacientes = await em.find(Paciente,  {}, { populate: ["obraSocial"] });    
    res.json(pacientes);

}





export async function findOne(req: Request, res: Response) {

    const paciente = await em.findOne(Paciente, 
        {idPaciente: Number(req.params.id)}, 
        { populate: ["obraSocial"] } 
    );

    if (!paciente)
        return res.sendStatus(404);

    res.json(paciente);
}




export async function add(req: Request, res: Response) {

    if (await existeUsuario(req.body.nombreUsuario)) {
        return res.status(400).json({ message: "El nombre de usuario ya existe"});
    }
    
    if (!req.body.password) 
        return res.status(400).json({ message: "La contraseña es obligatoria" });
    
    
    let obraSocial = null; 
    if (req.body.idObra) { 
        obraSocial = await em.findOne( ObraSocial, { idObra: req.body.idObra } );
        if (!obraSocial)
            return res.status(404).json({ message: "Obra Social inexistente" });
    }

    const paciente = em.create( Paciente,
            {
                nombre: req.body.nombre,
                apellido: req.body.apellido,
                dni: req.body.dni,
                nombreUsuario: req.body.nombreUsuario,
                password: await hashPassword(req.body.password),
                obraSocial
            }
        );

    await em.persistAndFlush(paciente);

    res.status(201).json(paciente);

}






export async function update(req: Request, res: Response) {

    const paciente = await em.findOne( Paciente,{ idPaciente: Number(req.params.id) } );

    if (!paciente)
        return res.sendStatus(404);

    const { password, ...datos } = req.body;
    em.assign(paciente, datos);

    let obraSocial = null; 
    if (req.body.idObra) {
        obraSocial = await em.findOne(ObraSocial,{idObra: req.body.idObra});
        if (!obraSocial)
            return res.status(404).json({ message: "Obra Social inexistente" });
    }
    paciente.obraSocial = obraSocial;

    await em.flush();

    res.json(paciente);
}





export async function remove(req: Request, res: Response) {

    const paciente =
        await em.findOne(Paciente, {idPaciente:Number(req.params.id)} );

    if (!paciente)
        return res.sendStatus(404);

    await em.removeAndFlush(paciente);

    res.sendStatus(204);

}