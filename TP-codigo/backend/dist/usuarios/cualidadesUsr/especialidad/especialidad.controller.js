import { orm } from "../../../shared/orm.js";
import { Especialidad } from "./especialidad.entity.js";
const em = orm.em;
//GETALL
//Equivalente - SELECT * FROM especialidad;
export async function findAll(req, res) {
    const especialidades = await em.find(Especialidad, {});
    res.json(especialidades);
}
//GETONE
//Equivalente - SELECT * FROM especialidad WHERE idEspecialidad = ?
export async function findOne(req, res) {
    const especialidad = await em.findOne(Especialidad, { idEspecialidad: Number(req.params.id) });
    if (!especialidad) {
        return res.status(404).json({ message: "Especialidad inexistente" });
    }
    res.json(especialidad);
}
//ADD
//Crear y guardar una nueva especialidad en la base de datos
export async function add(req, res) {
    const especialidad = em.create(Especialidad, req.body);
    await em.persistAndFlush(especialidad);
    res.status(201).json(especialidad);
}
//UPDATE
//Actualizar una especialidad existente en la base de datos
export async function update(req, res) {
    const especialidad = await em.findOne(Especialidad, { idEspecialidad: Number(req.params.id) });
    if (!especialidad)
        return res.status(404).json({ message: "Especialidad inexistente" });
    em.assign(especialidad, req.body);
    await em.flush();
    res.json(especialidad);
}
//DELETE
//Eliminar una especialidad existente en la base de datos
export async function remove(req, res) {
    const especialidad = await em.findOne(Especialidad, { idEspecialidad: Number(req.params.id) });
    if (!especialidad)
        return res.status(404).json({ message: "Especialidad inexistente" });
    await em.removeAndFlush(especialidad);
    res.status(204).json({ message: "Especialidad eliminada" });
}
//# sourceMappingURL=especialidad.controller.js.map