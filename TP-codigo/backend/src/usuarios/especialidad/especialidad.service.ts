import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { Especialidad } from "./especialidad.entity.js";
import { Medico } from "../medico/medico.entity.js";

const em = orm.em;

//get all
export async function listar() {
    return em.find(Especialidad, {});
}

//get one
export async function obtener(id: number) {

    const especialidad = await em.findOne(Especialidad, { idEspecialidad: id });
    if (!especialidad)
        throw new ErrorNegocio(404, "Especialidad inexistente");

    return especialidad;
}


//add
export async function crear(datos: any) {
    const nombreEspecialidad = datos.nombreEspecialidad?.trim();


    if (!nombreEspecialidad)
        throw new ErrorNegocio(400, "El nombre de la especialidad es obligatorio");

    const existente = await em.findOne(Especialidad, { nombreEspecialidad });
    if (existente)
        throw new ErrorNegocio(400, "Ya existe una especialidad con ese nombre");

    const especialidad = em.create(Especialidad, { ...datos, nombreEspecialidad });
    await em.persistAndFlush(especialidad);

    return especialidad;
}


//update
export async function actualizar(id: number, datos: any) {
    const especialidad = await obtener(id);

    // validacion de nombre
    if (datos.nombreEspecialidad) {
        const nombreEspecialidad = datos.nombreEspecialidad.trim();

        const existente = await em.findOne(Especialidad, { nombreEspecialidad });
        if (existente && existente.idEspecialidad !== especialidad.idEspecialidad)
            throw new ErrorNegocio(400, "Ya existe otra especialidad con ese nombre");

        datos = { ...datos, nombreEspecialidad };
    }

    em.assign(especialidad, datos);
    await em.flush();

    return especialidad;
}


//delete
export async function eliminar(id: number) {
    const especialidad = await obtener(id);
    
    if (await em.count(Medico, { especialidad })) 
        throw new ErrorNegocio(400, "No se puede eliminar: hay médicos con esta especialidad");
    
    await em.removeAndFlush(especialidad);
}