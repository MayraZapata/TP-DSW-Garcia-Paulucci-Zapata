import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { hashPassword } from "../../shared/password.js";
import { normalizarDni, validarDni, buscarPacientePorDni, esErrorDniDuplicado } from "../../shared/dni.js";

import { Paciente } from "./paciente.entity.js";
import * as obraSocialService from "../obraSocial/obraSocial.service.js";
import { existeUsuario } from "../existeUsuario.js";
import { Atencion } from "../../turno/atencion/Atencion.entity.js";

const em = orm.em;

//Normaliza y valida el DNI. Ej: "47.076.568" -> "47076568". Devuelve el DNI limpio o lanza 400.
function dniValido(valor: unknown): string {
    const dni = normalizarDni(valor);
    const errorDni = validarDni(dni);
    if (errorDni)
        throw new ErrorNegocio(400, errorDni);
    return dni;
}


// validacion de DNI previo a guardar
async function guardar() {
    try {
        await em.flush();
    } catch (error) {
        if (esErrorDniDuplicado(error))
            throw new ErrorNegocio(400, "Ya existe un paciente con ese DNI");
        throw error;
    }
}

//get all
export async function listar() {
    return em.find(Paciente, {}, { populate: ["obraSocial"] });
}


// Siempre devuelve 200: que no exista no es un error (en la guardia significa "hay que registrarlo ahora")
export async function buscarPorDni(valor: unknown) {
    const dni = dniValido(valor);

    const paciente = await buscarPacientePorDni(em, dni);
    if (!paciente)
        return { existe: false, dni };

    return { existe: true, paciente };
}


//get one
export async function obtener(id: number) {

    const paciente = await em.findOne(Paciente, { idPaciente: id }, { populate: ["obraSocial"] });
    if (!paciente)
        throw new ErrorNegocio(404, "Paciente inexistente");

    return paciente;
}


//add
export async function crear(datos: any) {
    if (!datos.nombreUsuario)
        throw new ErrorNegocio(400, "El nombre de usuario es obligatorio");
    if (await existeUsuario(datos.nombreUsuario))
        throw new ErrorNegocio(400, "El nombre de usuario ya existe");

    if (!datos.password)
        throw new ErrorNegocio(400, "La contraseña es obligatoria");
    if (!datos.nombre || !datos.apellido)
        throw new ErrorNegocio(400, "El nombre y el apellido son obligatorios");

    // DNI: se ignoran puntos y espacios y no puede repetirse
    const dni = dniValido(datos.dni);
    if (await buscarPacientePorDni(em, dni))
        throw new ErrorNegocio(400, "Ya existe un paciente con ese DNI");

    let obraSocial = null;
    if (datos.idObra)
        obraSocial = await obraSocialService.obtener(Number(datos.idObra));

    const paciente = em.create(Paciente, {
        nombre: datos.nombre,
        apellido: datos.apellido,
        dni,
        nombreUsuario: datos.nombreUsuario,
        password: await hashPassword(datos.password),
        obraSocial,
    });

    em.persist(paciente);
    await guardar();

    return paciente;
}



//update
export async function actualizar(id: number, body: any) {
    const paciente = await obtener(id);

    // La contraseña NO se cambia por acá 
    const { password, ...datos } = body;

    //validacion de nombre de usuario
    if (datos.nombreUsuario !== undefined && datos.nombreUsuario !== paciente.nombreUsuario) {
    if (!datos.nombreUsuario)
        throw new ErrorNegocio(400, "El nombre de usuario no puede estar vacío");
    if (await existeUsuario(datos.nombreUsuario))
        throw new ErrorNegocio(400, "El nombre de usuario ya existe");
}

    // se normaliza dni y no puede ser de OTRO paciente 
    if (datos.dni !== undefined) {
        const dni = dniValido(datos.dni);
        const otro = await buscarPacientePorDni(em, dni);
        if (otro && otro.idPaciente !== paciente.idPaciente)
            throw new ErrorNegocio(400, "Ya existe un paciente con ese DNI");
        datos.dni = dni;
    }

    let obraSocial = null;
    if (datos.idObra)
        obraSocial = await obraSocialService.obtener(Number(datos.idObra));

    em.assign(paciente, datos);
    paciente.obraSocial = obraSocial;   // sin idObra, queda sin obra social
    await guardar();

    return paciente;
}



//delete
export async function eliminar(id: number) {
    const paciente = await obtener(id);

    if (await em.count(Atencion, { paciente }))
        throw new ErrorNegocio(400, "No se puede eliminar: el paciente tiene atenciones registradas (turnos o urgencias)");

    await em.removeAndFlush(paciente);
}