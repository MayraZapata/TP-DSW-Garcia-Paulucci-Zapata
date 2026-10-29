import { orm } from "../shared/orm.js";
import { ErrorNegocio } from "../shared/errorNegocio.js";
import { verifyPassword, hashPassword } from "../shared/password.js";
import { Rol } from "../shared/jwt.js";

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


// Lo que el controlador necesita para armar el token y la respuesta
interface Sesion {
    rol: Rol;
    id: number;
    usuario: object;
}




// Verifica usuario y contraseña. Se prueba como paciente, después médico y después administrador.
export async function autenticar(usuario: unknown, password: unknown): Promise<Sesion> {
    if (typeof usuario !== "string" || typeof password !== "string" || !usuario || !password)
        throw new ErrorNegocio(400, "Faltan credenciales");

    const paciente = await em.findOne(Paciente, { nombreUsuario: usuario });
    if (paciente && await verifyPassword(password, paciente.password))
        return { rol: "PACIENTE", id: paciente.idPaciente!, usuario: datosPaciente(paciente) };

    const medico = await em.findOne(Medico, { nombreUsuario: usuario });
    if (medico && await verifyPassword(password, medico.password))
        return { rol: "MEDICO", id: medico.matricula, usuario: datosMedico(medico) };

    const admin = await em.findOne(Administrador, { nombreUsuario: usuario });
    if (admin && await verifyPassword(password, admin.password))
        return { rol: "ADMIN", id: admin.idAdministrador, usuario: {} };

    throw new ErrorNegocio(401, "Usuario o contraseña incorrectos");
}



// Obtener la sesion
export async function obtenerSesion(rol: Rol, id: number) {
    if (rol === "PACIENTE") {
        const p = await em.findOne(Paciente, { idPaciente: id });
        if (p) return { rol, usuario: datosPaciente(p) };
    } else if (rol === "MEDICO") {
        const m = await em.findOne(Medico, { matricula: id });
        if (m) return { rol, usuario: datosMedico(m) };
    } else if (rol === "ADMIN") {
        const a = await em.findOne(Administrador, { idAdministrador: id });
        if (a) return { rol, usuario: {} };
    }

    throw new ErrorNegocio(401, "Sesión inválida");
}




async function buscarCuenta(rol: Rol, id: number) {
    if (rol === "PACIENTE") return em.findOne(Paciente, { idPaciente: id });
    if (rol === "MEDICO") return em.findOne(Medico, { matricula: id });
    if (rol === "ADMIN") return em.findOne(Administrador, { idAdministrador: id });
}




//cambiar contraseña
export async function cambiarPassword(rol: Rol, id: number, passwordActual: unknown, passwordNueva: unknown) {
    if (typeof passwordActual !== "string" || typeof passwordNueva !== "string" || !passwordActual || !passwordNueva)
        throw new ErrorNegocio(400, "Faltan datos");
    if (passwordNueva.length < 6)
        throw new ErrorNegocio(400, "La nueva contraseña debe tener al menos 6 caracteres");

    const cuenta = await buscarCuenta(rol, id);
    if (!cuenta)
        throw new ErrorNegocio(401, "Sesión inválida");

    if (!(await verifyPassword(passwordActual, cuenta.password)))
        throw new ErrorNegocio(400, "La contraseña actual es incorrecta");

    cuenta.password = await hashPassword(passwordNueva);
    await em.flush();
}