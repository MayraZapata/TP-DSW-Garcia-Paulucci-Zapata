import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";


import { Medico } from "./medico.entity.js";
import * as especialidadService from "../especialidad/especialidad.service.js";
import { Atencion } from "../../turno/atencion/Atencion.entity.js";
import { crearUsuario, cambiarNombreUsuario, establecerPassword } from "../usuario/usuario.service.js";


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
    if (!datos.idEspecialidad)
        throw new ErrorNegocio(400, "La especialidad es obligatoria");

    const especialidad = await especialidadService.obtener(Number(datos.idEspecialidad));
    const usuario = await crearUsuario(em, { nombreUsuario: datos.nombreUsuario, password: datos.password }, "MEDICO");

    const medico = em.create(Medico, {
        matricula,
        usuario,
        nombre: datos.nombre,
        apellido: datos.apellido,
        especialidad,
    });

    await em.persistAndFlush(medico);

    return medico;
}


//update
export async function actualizar(matricula: number, body: any) {
    const medico = await obtener(matricula);

    const { nombreUsuario, password, nombre, apellido, idEspecialidad } = body;

    if (nombreUsuario !== undefined) {
        if (!nombreUsuario)
            throw new ErrorNegocio(400, "El nombre de usuario no puede estar vacío");
        await cambiarNombreUsuario(em, medico.usuario, nombreUsuario);
    }
    if (password) await establecerPassword(medico.usuario, password);
    if (nombre !== undefined) medico.nombre = nombre;
    if (apellido !== undefined) medico.apellido = apellido;
    if (idEspecialidad)
        medico.especialidad = await especialidadService.obtener(Number(idEspecialidad));

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