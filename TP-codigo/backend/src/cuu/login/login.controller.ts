import { Request, Response } from "express";
import { orm } from "../../shared/orm.js";

import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Administrador } from "../../usuarios/administrador/Administrador.entity.js";

const em = orm.em;

export async function login(
    req: Request,
    res: Response
) {

    const { usuario, password } = req.body;

    // Buscar paciente
    const paciente = await em.findOne(Paciente, {
        nombreUsuario: usuario,
        password,
    });

    if (paciente) {
        return res.json({
            rol: "PACIENTE",
            nombre: paciente.nombre,
        });
    }

    // Buscar médico
    const medico = await em.findOne(Medico, {
        nombreUsuario: usuario,
        password,
    });

    if (medico) {
        return res.json({
            rol: "MEDICO",
            nombre: medico.nombre,
        });
    }

    // Buscar administrador
    const administrador = await em.findOne(Administrador, {
        nombreUsuario: usuario,
        password,
    });

    if (administrador) {
        return res.json({
            rol: "ADMIN",
        });
    }

    return res.status(401).json({
        mensaje: "Usuario o contraseña incorrectos",
    });

}