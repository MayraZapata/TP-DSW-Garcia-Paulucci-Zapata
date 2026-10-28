import { Request, Response } from "express";
import { orm } from "../../shared/orm.js";
import { hashPassword } from "../../shared/password.js";

import { Paciente } from "./paciente.entity.js";
import { ObraSocial } from "../cualidadesUsr/obraSocial/obraSocial.entity.js";
import { existeUsuario } from "../existeUsuario.js";
import { normalizarDni, validarDni, buscarPacientePorDni, esErrorDniDuplicado } from "./dni.js";

const em = orm.em;

export async function findAll(req: Request, res: Response) {

    const pacientes = await em.find(Paciente,  {}, { populate: ["obraSocial"] });    
    res.json(pacientes);

}





// Busca un paciente por DNI (ignora puntos y espacios). Siempre responde 200:
//   { existe: true, paciente: {...} }   o   { existe: false, dni: "..." }
// (que no exista no es un error: en la guardia significa "hay que registrarlo ahora")
export async function findByDni(req: Request, res: Response) {

    const dni = normalizarDni(req.params.dni);
    const errorDni = validarDni(dni);
    if (errorDni)
        return res.status(400).json({ message: errorDni });

    const paciente = await buscarPacientePorDni(em, dni);

    if (!paciente)
        return res.json({ existe: false, dni });

    res.json({ existe: true, paciente });
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

    // DNI: se ignoran puntos y espacios ("47.076.568" es igual a "47076568") y no puede repetirse
    const dni = normalizarDni(req.body.dni);
    const errorDni = validarDni(dni);
    if (errorDni)
        return res.status(400).json({ message: errorDni });
    if (await buscarPacientePorDni(em, dni))
        return res.status(400).json({ message: "Ya existe un paciente con ese DNI" });
    
    
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
                dni,
                nombreUsuario: req.body.nombreUsuario,
                password: await hashPassword(req.body.password),
                obraSocial
            }
        );

    try {
        await em.persistAndFlush(paciente);
    } catch (error) {
        // Red de seguridad: dos registros con el mismo DNI exactamente a la vez
        if (esErrorDniDuplicado(error))
            return res.status(400).json({ message: "Ya existe un paciente con ese DNI" });
        throw error;
    }

    res.status(201).json(paciente);

}






export async function update(req: Request, res: Response) {

    const paciente = await em.findOne( Paciente,{ idPaciente: Number(req.params.id) } );

    if (!paciente)
        return res.sendStatus(404);

    const { password, ...datos } = req.body;

    // Si viene un DNI: se normaliza y no puede ser de OTRO paciente (el propio sí, así se puede guardar sin cambiarlo)
    if (datos.dni !== undefined) {
        const dni = normalizarDni(datos.dni);
        const errorDni = validarDni(dni);
        if (errorDni)
            return res.status(400).json({ message: errorDni });
        const otro = await buscarPacientePorDni(em, dni);
        if (otro && otro.idPaciente !== paciente.idPaciente)
            return res.status(400).json({ message: "Ya existe un paciente con ese DNI" });
        datos.dni = dni;
    }

    em.assign(paciente, datos);

    let obraSocial = null; 
    if (req.body.idObra) {
        obraSocial = await em.findOne(ObraSocial,{idObra: req.body.idObra});
        if (!obraSocial)
            return res.status(404).json({ message: "Obra Social inexistente" });
    }
    paciente.obraSocial = obraSocial;

    try {
        await em.flush();
    } catch (error) {
        if (esErrorDniDuplicado(error))
            return res.status(400).json({ message: "Ya existe un paciente con ese DNI" });
        throw error;
    }

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