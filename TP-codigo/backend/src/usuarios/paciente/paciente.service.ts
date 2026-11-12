import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { normalizarDni, validarDni, buscarPacientePorDni, esErrorDniDuplicado } from "../../shared/dni.js";

import { Paciente } from "./paciente.entity.js";
import * as obraSocialService from "../obraSocial/obraSocial.service.js";
import { Atencion } from "../../turno/atencion/Atencion.entity.js";
import { crearUsuario, cambiarNombreUsuario } from "../usuario/usuario.service.js";

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

    if (!datos.nombre || !datos.apellido)
        throw new ErrorNegocio(400, "El nombre y el apellido son obligatorios");

    // DNI: se ignoran puntos y espacios y no puede repetirse
    const dni = dniValido(datos.dni);
    if (await buscarPacientePorDni(em, dni))
        throw new ErrorNegocio(400, "Ya existe un paciente con ese DNI");

    let obraSocial = null;
    if (datos.idObra)
        obraSocial = await obraSocialService.obtener(Number(datos.idObra));

    const usuario = await crearUsuario(em, datos.nombreUsuario, datos.password, "PACIENTE");

    const paciente = em.create(Paciente, {
        usuario,
        nombre: datos.nombre,
        apellido: datos.apellido,
        dni,
        obraSocial,
    });

    em.persist(paciente);
    await guardar();  

    return paciente;
}


//update
export async function actualizar(id: number, datos: any) {
    const paciente = await obtener(id);

    if (datos.nombreUsuario !== undefined) {
        if (!datos.nombreUsuario)
            throw new ErrorNegocio(400, "El nombre de usuario no puede estar vacío");
        await cambiarNombreUsuario(em, paciente.usuario, datos.nombreUsuario);
    }

    if (datos.dni !== undefined) {
        const dni = dniValido(datos.dni);
        const otro = await buscarPacientePorDni(em, dni);
        if (otro && otro.idPaciente !== paciente.idPaciente)
            throw new ErrorNegocio(400, "Ya existe un paciente con ese DNI");
        paciente.dni = dni;
    }

    if (datos.nombre !== undefined) paciente.nombre = datos.nombre;
    if (datos.apellido !== undefined) paciente.apellido = datos.apellido;


    paciente.obraSocial = datos.idObra ? await obraSocialService.obtener(Number(datos.idObra)) : null;
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