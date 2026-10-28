import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { ObraSocial } from "./obraSocial.entity.js";

const em = orm.em;


//get all
export async function listar() {
    return em.find(ObraSocial, {});
}


//get
export async function obtener(id: number) {
    const obraSocial = await em.findOne(ObraSocial, { idObra: id });
    if (!obraSocial)
        throw new ErrorNegocio(404, "Obra Social inexistente");

    return obraSocial;
}


//add
export async function crear(datos: any) {
    const nombreObra = datos.nombreObra?.trim();
    if (!nombreObra)
        throw new ErrorNegocio(400, "El nombre de la obra social es obligatorio");

    const existente = await em.findOne(ObraSocial, { nombreObra });
    if (existente)
        throw new ErrorNegocio(400, "Ya existe una obra social con ese nombre");

    const obraSocial = em.create(ObraSocial, { ...datos, nombreObra });
    await em.persistAndFlush(obraSocial);

    return obraSocial;
}



//update
export async function actualizar(id: number, datos: any) {
    const obraSocial = await obtener(id);

    if (datos.nombreObra) {
        const nombreObra = datos.nombreObra.trim();
        const existente = await em.findOne(ObraSocial, { nombreObra });
        if (existente && existente.idObra !== obraSocial.idObra)
            throw new ErrorNegocio(400, "Ya existe otra obra social con ese nombre");

        datos = { ...datos, nombreObra };
    }

    em.assign(obraSocial, datos);
    await em.flush();

    return obraSocial;
}


//delete
export async function eliminar(id: number) {
    const obraSocial = await obtener(id);
    await em.removeAndFlush(obraSocial);
}