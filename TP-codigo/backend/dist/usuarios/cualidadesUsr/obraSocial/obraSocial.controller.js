import { orm } from "../../../shared/orm.js";
import { ObraSocial } from "./obraSocial.entity.js";
const em = orm.em;
//GETALL
//Equivalente - SELECT * FROM obraSocial;
export async function findAll(req, res) {
    const obrasSociales = await em.find(ObraSocial, {});
    res.json(obrasSociales);
}
//GETONE
//Equivalente - SELECT * FROM obraSocial WHERE idObraSocial = ?
export async function findOne(req, res) {
    const obraSocial = await em.findOne(ObraSocial, { idObra: Number(req.params.id) });
    if (!obraSocial) {
        return res.status(404).json({ message: "Obra Social inexistente" });
    }
    res.json(obraSocial);
}
//ADD
//Crear y guardar una nueva especialidad en la base de datos
export async function add(req, res) {
    const obraSocial = em.create(ObraSocial, req.body);
    await em.persistAndFlush(obraSocial);
    res.status(201).json(obraSocial);
}
//UPDATE
//Actualizar una especialidad existente en la base de datos
export async function update(req, res) {
    const obraSocial = await em.findOne(ObraSocial, { idObra: Number(req.params.id) });
    if (!obraSocial)
        return res.status(404).json({ message: "Obra Social inexistente" });
    em.assign(obraSocial, req.body);
    await em.flush();
    res.json(obraSocial);
}
//DELETE
//Eliminar una especialidad existente en la base de datos
export async function remove(req, res) {
    const obraSocial = await em.findOne(ObraSocial, { idObra: Number(req.params.id) });
    if (!obraSocial)
        return res.status(404).json({ message: "Obra Social inexistente" });
    await em.removeAndFlush(obraSocial);
    res.status(204).json({ message: "Obra Social eliminada" });
}
//# sourceMappingURL=obraSocial.controller.js.map