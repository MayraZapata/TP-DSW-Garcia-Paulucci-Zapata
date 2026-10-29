import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { Diagnostico } from "./diagnostico.entity.js";
import { Atencion } from "../atencion/Atencion.entity.js";

const em = orm.em;

// GET ALL
export async function listar() {
    return em.find(Diagnostico, {});
}

// GET ONE
export async function obtener(id: number) {
    const diagnostico = await em.findOne(Diagnostico, { idDiagnostico: id });
    if (!diagnostico) {
        throw new ErrorNegocio(404, "Diagnostico inexistente");
    }

    return diagnostico;
}

// ADD
export async function crear(datos: any) {
    const nombreDiagnostico = datos.nombreDiagnostico?.trim();

    if (!nombreDiagnostico) {
        throw new ErrorNegocio(400, "El nombre del diagnóstico es obligatorio");
    }

    // Evitar cargar dos veces el mismo diagnóstico como filas distintas del catálogo
    const existente = await em.findOne(Diagnostico, { nombreDiagnostico });
    if (existente) {
        throw new ErrorNegocio(400, "Ya existe un diagnóstico con ese nombre");
    }

    const diagnostico = em.create(Diagnostico, { ...datos, nombreDiagnostico });
    await em.persistAndFlush(diagnostico);

    return diagnostico;
}

// UPDATE
export async function actualizar(id: number, datos: any) {
    const diagnostico = await obtener(id);

    // Si se está modificando el nombre, chequear que no choque con otro diagnóstico ya cargado
    if (datos.nombreDiagnostico !== undefined) {
        const nombreDiagnostico = datos.nombreDiagnostico.trim();

        if (!nombreDiagnostico) {
            throw new ErrorNegocio(400, "El nombre del diagnóstico no puede estar vacío");
        }

        const existente = await em.findOne(Diagnostico, { nombreDiagnostico });
        if (existente && existente.idDiagnostico !== diagnostico.idDiagnostico) {
            throw new ErrorNegocio(400, "Ya existe otro diagnóstico con ese nombre");
        }

        datos = { ...datos, nombreDiagnostico };
    }

    em.assign(diagnostico, datos);
    await em.flush();

    return diagnostico;
}

// DELETE
export async function eliminar(id: number) {
    const diagnostico = await obtener(id);

    // Validación de integridad referencial: no eliminar si ya fue asignado en atenciones
    if (await em.count(Atencion, { diagnostico })) {
        throw new ErrorNegocio(400, "No se puede eliminar: hay atenciones asociadas a este diagnóstico");
    }

    await em.removeAndFlush(diagnostico);
}