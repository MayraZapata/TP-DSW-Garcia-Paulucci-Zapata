import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { hashPassword } from "../../shared/password.js";

import { Medico } from "./medico.entity.js";
import * as especialidadService from "../especialidad/especialidad.service.js";
import { existeUsuario } from "../existeUsuario.js";
import { Atencion } from "../../turno/atencion/Atencion.entity.js";

const em = orm.em;

//get all
export async function listar() {
    return em.find(Medico, {}, { populate: ["especialidad"] });
}


//get one
export async function obtener(matricula: number) {
    if (!Number.isInteger(matricula))
        throw new ErrorNegocio(400, "La matrícula debe ser un número");

    const medico = await em.findOne(Medico, { matricula }, { populate: ["especialidad"] });
    if (!medico)
        throw new ErrorNegocio(404, "Médico inexistente");

    return medico;
}



//get by especialidad
export async function listarPorEspecialidad(idEspecialidad: number) {
    const especialidad = await especialidadService.obtener(idEspecialidad);   

    const medicos = await em.find(Medico, { especialidad }, { populate: ["especialidad"] });
    if (medicos.length === 0)
        throw new ErrorNegocio(404, "No se encontraron médicos disponibles para la especialidad seleccionada");

    return medicos;
}



//add
export async function crear(datos: any) {
    const matricula = Number(datos.matricula);
    if (!Number.isInteger(matricula) || matricula <= 0)
        throw new ErrorNegocio(400, "La matrícula debe ser un número entero positivo");
    if (await em.findOne(Medico, { matricula }))
        throw new ErrorNegocio(400, "La matrícula ya existe");

    if (!datos.nombre || !datos.apellido)
        throw new ErrorNegocio(400, "El nombre y el apellido son obligatorios");
    if (!datos.nombreUsuario)
        throw new ErrorNegocio(400, "El nombre de usuario es obligatorio");
    if (!datos.password)
        throw new ErrorNegocio(400, "La contraseña es obligatoria");
    if (!datos.idEspecialidad)
        throw new ErrorNegocio(400, "La especialidad es obligatoria");

    if (await existeUsuario(datos.nombreUsuario))
        throw new ErrorNegocio(400, "El nombre de usuario ya existe");

    const especialidad = await especialidadService.obtener(Number(datos.idEspecialidad));

    const medico = em.create(Medico, {
        matricula,
        nombre: datos.nombre,
        apellido: datos.apellido,
        nombreUsuario: datos.nombreUsuario,
        password: await hashPassword(datos.password),
        especialidad,
    });

    await em.persistAndFlush(medico);

    return medico;
}



//update
export async function actualizar(matricula: number, body: any) {
    const medico = await obtener(matricula);

    // La matrícula es la clave primaria: se ignora si viene en el body
    const { password, idEspecialidad, matricula: _ignorada, ...datos } = body;

    if (datos.nombreUsuario !== undefined && datos.nombreUsuario !== medico.nombreUsuario) {
    if (!datos.nombreUsuario)
        throw new ErrorNegocio(400, "El nombre de usuario no puede estar vacío");
    if (await existeUsuario(datos.nombreUsuario))
        throw new ErrorNegocio(400, "El nombre de usuario ya existe");
}

    let especialidad = null;
    if (idEspecialidad)
        especialidad = await especialidadService.obtener(Number(idEspecialidad));

    em.assign(medico, datos);
    if (password) medico.password = await hashPassword(password);
    if (especialidad) medico.especialidad = especialidad;

    await em.flush();

    return medico;
}



//delete
export async function eliminar(matricula: number) {
    const medico = await obtener(matricula);

    if (await em.count(Atencion, { medico }))
        throw new ErrorNegocio(400, "No se puede eliminar: el médico tiene atenciones registradas (turnos o urgencias)");

    await em.removeAndFlush(medico);
}