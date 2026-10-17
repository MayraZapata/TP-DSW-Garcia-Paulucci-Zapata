import { Request, Response } from "express";
import { UniqueConstraintViolationException } from "@mikro-orm/core";
import { orm } from "../../shared/orm.js";
import { hashPassword } from "../../shared/password.js";

import { Paciente } from "./paciente.entity.js";
import { ObraSocial } from "../cualidadesUsr/obraSocial/obraSocial.entity.js";
import { existeUsuario } from "../existeUsuario.js";
import { normalizarDni, dniEsValido, buscarPacientePorDni, MENSAJE_DNI_INVALIDO, MENSAJE_DNI_REPETIDO } from "./dni.js";

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


    // El DNI se guarda "normalizado" (sin puntos ni espacios) y no puede repetirse
    const dni = normalizarDni(req.body.dni);
    if (!dniEsValido(dni))
        return res.status(400).json({ message: MENSAJE_DNI_INVALIDO });

    if (await buscarPacientePorDni(dni))
        return res.status(409).json({ message: MENSAJE_DNI_REPETIDO });
    
    
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
        // Red de seguridad: si dos personas se registran a la vez, la base rechaza el duplicado
        if (error instanceof UniqueConstraintViolationException)
            return res.status(409).json({ message: "Ya existe un paciente con ese DNI o con ese nombre de usuario" });
        throw error;
    }

    res.status(201).json(paciente);

}






export async function update(req: Request, res: Response) {

    const paciente = await em.findOne( Paciente,{ idPaciente: Number(req.params.id) } );

    if (!paciente)
        return res.sendStatus(404);

    const { password, ...datos } = req.body;

    // Si se está cambiando el DNI: mismas reglas que en el registro, pero un
    // paciente no choca consigo mismo (por eso se excluye su propio id)
    if (datos.dni !== undefined) {
        const dni = normalizarDni(datos.dni);
        if (!dniEsValido(dni))
            return res.status(400).json({ message: MENSAJE_DNI_INVALIDO });

        if (await buscarPacientePorDni(dni, paciente.idPaciente))
            return res.status(409).json({ message: MENSAJE_DNI_REPETIDO });

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
        if (error instanceof UniqueConstraintViolationException)
            return res.status(409).json({ message: "Ya existe un paciente con ese DNI o con ese nombre de usuario" });
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





// GUARDIA - Buscar un paciente por DNI (ignora puntos y espacios).
// Responde 200 siempre: { existe: true, paciente } o { existe: false, dni } para que la
// pantalla de ingreso decida si autocompleta los datos o pide registrar al paciente.
export async function buscarPorDni(req: Request, res: Response) {

    const dni = normalizarDni(req.params.dni);
    if (!dniEsValido(dni))
        return res.status(400).json({ message: MENSAJE_DNI_INVALIDO });

    const paciente = await buscarPacientePorDni(dni);

    if (!paciente)
        return res.json({ existe: false, dni });

    // Solo los datos que necesita la pantalla de ingreso (no se expone nombre de usuario ni contraseña)
    res.json({
        existe: true,
        paciente: {
            idPaciente: paciente.idPaciente,
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            dni: paciente.dni,
            obraSocial: paciente.obraSocial ?? null,
        },
    });
}





// GUARDIA - Registrar a un paciente nuevo al momento del ingreso.
// Se le crea la cuenta con usuario y contraseña iniciales IGUALES A SU DNI
// (la contraseña se guarda encriptada, como en el resto del sistema).
export async function altaPorGuardia(req: Request, res: Response) {

    const nombre = typeof req.body.nombre === "string" ? req.body.nombre.trim() : "";
    const apellido = typeof req.body.apellido === "string" ? req.body.apellido.trim() : "";
    if (!nombre || !apellido)
        return res.status(400).json({ message: "El nombre y el apellido son obligatorios" });

    const dni = normalizarDni(req.body.dni);
    if (!dniEsValido(dni))
        return res.status(400).json({ message: MENSAJE_DNI_INVALIDO });

    if (await buscarPacientePorDni(dni))
        return res.status(409).json({ message: MENSAJE_DNI_REPETIDO });

    // El usuario inicial es el DNI: si otra cuenta ya usa ese nombre de usuario, no se puede crear
    if (await existeUsuario(dni)) {
        return res.status(409).json({
            message: `No se pudo crear la cuenta: el nombre de usuario "${dni}" ya lo usa otra cuenta. Revisalo en Gestión de Pacientes / Médicos.`,
        });
    }

    let obraSocial = null;
    if (req.body.idObra) {
        obraSocial = await em.findOne(ObraSocial, { idObra: Number(req.body.idObra) });
        if (!obraSocial)
            return res.status(404).json({ message: "Obra Social inexistente" });
    }

    const paciente = em.create(Paciente, {
        nombre,
        apellido,
        dni,
        nombreUsuario: dni,
        password: await hashPassword(dni),
        obraSocial,
    });

    try {
        await em.persistAndFlush(paciente);
    } catch (error) {
        if (error instanceof UniqueConstraintViolationException)
            return res.status(409).json({ message: "Ya existe un paciente con ese DNI o con ese nombre de usuario" });
        throw error;
    }

    res.status(201).json(paciente);
}
