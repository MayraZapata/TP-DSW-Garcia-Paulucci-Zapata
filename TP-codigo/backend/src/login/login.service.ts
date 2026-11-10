import { orm } from "../shared/orm.js";
import { ErrorNegocio } from "../shared/errorNegocio.js";
import { verifyPassword } from "../shared/password.js";
import { Rol } from "../shared/jwt.js";

import { Usuario } from "../usuarios/usuario/usuario.entity.js";
import { Paciente } from "../usuarios/paciente/paciente.entity.js";
import { Medico } from "../usuarios/medico/medico.entity.js";
import { establecerPassword } from "../usuarios/usuario/usuario.service.js";

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
    idUsuario: number;
    usuario: object;
}

// A partir de la cuenta, carga el perfil que corresponde a su rol
async function armarSesion(cuenta: Usuario): Promise<Sesion> {
    const idUsuario = cuenta.idUsuario!;

    if (cuenta.rol === "PACIENTE") {
        const p = await em.findOne(Paciente, { usuario: cuenta });
        if (p) return { rol: "PACIENTE", id: p.idPaciente!, idUsuario, usuario: datosPaciente(p) };
    } else if (cuenta.rol === "MEDICO") {
        const m = await em.findOne(Medico, { usuario: cuenta });
        if (m) return { rol: "MEDICO", id: m.matricula, idUsuario, usuario: datosMedico(m) };
    } else if (cuenta.rol === "ADMIN") {
        return { rol: "ADMIN", id: idUsuario, idUsuario, usuario: {} };
    }

    throw new ErrorNegocio(401, "Sesión inválida");
}

// Un token viejo (anterior a este cambio) no trae idUsuario: se trata como sesión inválida
async function buscarUsuario(idUsuario: unknown): Promise<Usuario> {
    if (!Number.isInteger(idUsuario))
        throw new ErrorNegocio(401, "Sesión inválida");

    const cuenta = await em.findOne(Usuario, { idUsuario: idUsuario as number });
    if (!cuenta)
        throw new ErrorNegocio(401, "Sesión inválida");
    return cuenta;
}

// Verifica usuario y contraseña (una sola consulta, sin importar el rol)
export async function autenticar(usuario: unknown, password: unknown): Promise<Sesion> {
    if (typeof usuario !== "string" || typeof password !== "string" || !usuario || !password)
        throw new ErrorNegocio(400, "Faltan credenciales");

    const cuenta = await em.findOne(Usuario, { nombreUsuario: usuario });
    if (!cuenta || !(await verifyPassword(password, cuenta.password)))
        throw new ErrorNegocio(401, "Usuario o contraseña incorrectos");

    return armarSesion(cuenta);
}

// Obtener la sesion
export async function obtenerSesion(idUsuario: number) {
    const { rol, usuario } = await armarSesion(await buscarUsuario(idUsuario));
    return { rol, usuario };
}

//cambiar contraseña
export async function cambiarPassword(idUsuario: number, passwordActual: unknown, passwordNueva: unknown) {
    if (typeof passwordActual !== "string" || typeof passwordNueva !== "string" || !passwordActual || !passwordNueva)
        throw new ErrorNegocio(400, "Faltan datos");
    if (passwordNueva.length < 6)
        throw new ErrorNegocio(400, "La nueva contraseña debe tener al menos 6 caracteres");

    const cuenta = await buscarUsuario(idUsuario);

    if (!(await verifyPassword(passwordActual, cuenta.password)))
        throw new ErrorNegocio(400, "La contraseña actual es incorrecta");

    await establecerPassword(cuenta, passwordNueva);
    await em.flush();
}