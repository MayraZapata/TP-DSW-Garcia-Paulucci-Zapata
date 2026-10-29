import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { TipoUrgencia } from "./tipoUrgencia.entity.js";
import { Urgencia } from "../urgencia/Urgencia.entity.js";

const em = orm.em;

// TIPO "OTRO": es un tipo más de la tabla, pero urgencia.service lo reconoce por su NOMBRE
// para permitir la descripción opcional (detalleTipo). Se exporta para que lo use ese service.
const NOMBRE_TIPO_OTRO = "otro";
export const esTipoOtro = (tipo: TipoUrgencia) => tipo.nombre.trim().toLowerCase() === NOMBRE_TIPO_OTRO;


// Límites de las columnas de la tabla TipoUrgencia (nombre VARCHAR(50), descripcionTipo VARCHAR(100))
function validarNombre(valor: unknown): string {
    const nombre = String(valor ?? "").trim();
    if (!nombre)
        throw new ErrorNegocio(400, "El nombre del tipo de urgencia es obligatorio");
    if (nombre.length > 50)
        throw new ErrorNegocio(400, "El nombre del tipo de urgencia no puede superar los 50 caracteres");
    return nombre;
}

function validarDescripcion(valor: unknown): string {
    const descripcion = String(valor ?? "").trim();
    if (descripcion.length > 100)
        throw new ErrorNegocio(400, "La descripción del tipo de urgencia no puede superar los 100 caracteres");
    return descripcion;
}


//get all
export async function listar() {
    return em.find(TipoUrgencia, {});
}


//get one
export async function obtener(id: number) {
    const tipoUrgencia = await em.findOne(TipoUrgencia, { idTipo: id });
    if (!tipoUrgencia)
        throw new ErrorNegocio(404, "Tipo de Urgencia inexistente");

    return tipoUrgencia;
}


//add
export async function crear(datos: any) {
    const nombre = validarNombre(datos.nombre);

    // Evitar cargar dos veces el mismo tipo como filas distintas del catálogo
    // (esto NO limita que un paciente entre varias veces por el mismo tipo de urgencia)
    const existente = await em.findOne(TipoUrgencia, { nombre });
    if (existente)
        throw new ErrorNegocio(400, "Ya existe un tipo de urgencia con ese nombre");

    // (Se arma con new + asignación porque idTipo lo genera la base: no se carga a mano)
    const tipoUrgencia = new TipoUrgencia();
    tipoUrgencia.nombre = nombre;
    tipoUrgencia.descripcionTipo = validarDescripcion(datos.descripcionTipo) || undefined;
    await em.persistAndFlush(tipoUrgencia);

    return tipoUrgencia;
}


//update
export async function actualizar(id: number, datos: any) {
    const tipoUrgencia = await obtener(id);

    // Si se está cambiando el nombre, chequear que no choque con otro tipo ya cargado
    if (datos.nombre !== undefined) {
        const nombre = validarNombre(datos.nombre);

        const existente = await em.findOne(TipoUrgencia, { nombre });
        if (existente && existente.idTipo !== tipoUrgencia.idTipo)
            throw new ErrorNegocio(400, "Ya existe otro tipo de urgencia con ese nombre");

        // Como las urgencias reconocen el tipo "Otro" por su nombre, si se lo renombra
        // se rompe la descripción opcional (detalleTipo). Si no lo querés, borrá este bloque.
        if (esTipoOtro(tipoUrgencia) && nombre.toLowerCase() !== NOMBRE_TIPO_OTRO)
            throw new ErrorNegocio(400, "No se puede renombrar el tipo \"Otro\": el ingreso de urgencias lo usa por su nombre");
       

        tipoUrgencia.nombre = nombre;
    }

    if (datos.descripcionTipo !== undefined)
        tipoUrgencia.descripcionTipo = validarDescripcion(datos.descripcionTipo);

    await em.flush();

    return tipoUrgencia;
}


//delete
export async function eliminar(id: number) {
    const tipoUrgencia = await obtener(id);

    //Sin el tipo "Otro" no se puede cargar la descripción opcional.

    if (esTipoOtro(tipoUrgencia))
        throw new ErrorNegocio(400, "No se puede eliminar el tipo \"Otro\": el ingreso de urgencias lo usa");

    // La tabla atencion tiene una clave foránea hacia TipoUrgencia: sin este control, la base 
    // rechazaría el borrado y el usuario vería un error 500 en lugar de un mensaje claro.
    if (await em.count(Urgencia, { tipoUrgencia }))
        throw new ErrorNegocio(400, "No se puede eliminar: hay urgencias registradas con este tipo");

    await em.removeAndFlush(tipoUrgencia);
}
