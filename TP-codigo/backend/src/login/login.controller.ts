import { Request, Response } from "express";
import { orm } from "../shared/orm.js";
import { verifyPassword, hashPassword } from "../shared/password.js";
import { firmarToken, Rol } from "../shared/jwt.js";
import { COOKIE_NAME, opcionesCookie } from "../shared/cookie.js";

import { Paciente } from "../usuarios/paciente/paciente.entity.js";
import { Medico } from "../usuarios/medico/medico.entity.js";
import { Administrador } from "../usuarios/administrador/Administrador.entity.js";

const em = orm.em;

const datosPaciente = (p: Paciente) => ({
    idPaciente: p.idPaciente,
    nombre: p.nombre,
    apellido: p.apellido,
    dni: p.dni,
});

const datosMedico = (m: Medico) => ({
    matricula: m.matricula,
    nombre: m.nombre,
    apellido: m.apellido,
});


// Firma el token, lo deja en la cookie y responde lo mismo que antes
function iniciarSesion(res: Response, rol: Rol, id: number, usuario: object) {
    const token = firmarToken({ rol, id });
    res.cookie(COOKIE_NAME, token, opcionesCookie);
    return res.json({ rol, usuario });
}




export async function login(req: Request, res: Response) {
    const { usuario, password } = req.body;

    if (typeof usuario !== "string" || typeof password !== "string" || !usuario || !password) {
        return res.status(400).json({ message: "Faltan credenciales" });
    }


    const paciente = await em.findOne(Paciente, { nombreUsuario: usuario });
    if (paciente && await verifyPassword(password, paciente.password)) {
        return iniciarSesion(res, "PACIENTE", paciente.idPaciente!, datosPaciente(paciente));
    }

    const medico = await em.findOne(Medico, { nombreUsuario: usuario });
    if (medico && await verifyPassword(password, medico.password)) {
        return iniciarSesion(res, "MEDICO", medico.matricula, datosMedico(medico));
    }

    const admin = await em.findOne(Administrador, { nombreUsuario: usuario });
    if (admin && await verifyPassword(password, admin.password)) {
        return iniciarSesion(res, "ADMIN", admin.idAdministrador, {});
    }

    return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
}




// ¿Autenticacion?
export async function me(req: Request, res: Response) {
    const { rol, id } = req.auth!; 

    if (rol === "PACIENTE") {
        const p = await em.findOne(Paciente, { idPaciente: id });
        if (p) return res.json({ rol, usuario: datosPaciente(p) });
    } else if (rol === "MEDICO") {
        const m = await em.findOne(Medico, { matricula: id });
        if (m) return res.json({ rol, usuario: datosMedico(m) });
    } else {
        const a = await em.findOne(Administrador, { idAdministrador: id });
        if (a) return res.json({ rol, usuario: {} });
    }

    // El token es válido pero el usuario ya no existe (lo borraron)
    return res.status(401).json({ message: "Sesión inválida" });
}

export function logout(_req: Request, res: Response) {
    res.clearCookie(COOKIE_NAME, opcionesCookie);
    res.sendStatus(204);
}





async function buscarCuenta(rol: Rol, id: number) {
    if (rol === "PACIENTE") return em.findOne(Paciente, { idPaciente: id });
    if (rol === "MEDICO") return em.findOne(Medico, { matricula: id });
    return em.findOne(Administrador, { idAdministrador: id });
}





export async function cambiarPassword(req: Request, res: Response) {
    const { passwordActual, passwordNueva } = req.body;

    if (typeof passwordActual !== "string" || typeof passwordNueva !== "string" || !passwordActual || !passwordNueva) {
        return res.status(400).json({ message: "Faltan datos" });
    }
    if (passwordNueva.length < 6) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const cuenta = await buscarCuenta(req.auth!.rol, req.auth!.id);
    if (!cuenta) return res.status(401).json({ message: "Sesión inválida" });

    // Se exige la actual: si alguien deja la PC con la sesión abierta, no puede cambiarte la clave
    if (!(await verifyPassword(passwordActual, cuenta.password))) {
        return res.status(400).json({ message: "La contraseña actual es incorrecta" });
    }

    cuenta.password = await hashPassword(passwordNueva);
    await em.flush();

    res.json({ message: "Contraseña actualizada" });
}