import { orm } from "../../shared/orm.js";
import { Paciente } from "./paciente.entity.js";
import { ObraSocial } from "../cualidadesUsr/obraSocial/obraSocial.entity.js";
import { existeUsuario } from "../existeUsuario.js";
const em = orm.em;
export async function findAll(req, res) {
    const pacientes = await em.find(Paciente, {}, { populate: ["obraSocial"] });
    res.json(pacientes);
}
export async function findOne(req, res) {
    const paciente = await em.findOne(Paciente, { idPaciente: Number(req.params.id) }, { populate: ["obraSocial"] });
    if (!paciente)
        return res.sendStatus(404);
    res.json(paciente);
}
export async function add(req, res) {
    if (await existeUsuario(req.body.nombreUsuario)) {
        return res.status(400).json({ message: "El nombre de usuario ya existe" });
    }
    let obraSocial = null;
    if (req.body.idObra) {
        obraSocial = await em.findOne(ObraSocial, { idObra: req.body.idObra });
    }
    if (!obraSocial)
        return res.status(404).json({ message: "Obra Social inexistente" });
    const paciente = em.create(Paciente, {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        dni: req.body.dni,
        nombreUsuario: req.body.nombreUsuario,
        password: req.body.password,
        obraSocial
    });
    await em.persistAndFlush(paciente);
    res.status(201).json(paciente);
}
export async function update(req, res) {
    const paciente = await em.findOne(Paciente, { idPaciente: Number(req.params.id) });
    if (!paciente)
        return res.sendStatus(404);
    em.assign(paciente, req.body);
    if (req.body.idObra) {
        const obraSocial = await em.findOne(ObraSocial, { idObra: req.body.idObra });
        if (obraSocial)
            paciente.obraSocial = obraSocial;
    }
    await em.flush();
    res.json(paciente);
}
export async function remove(req, res) {
    const paciente = await em.findOne(Paciente, { idPaciente: Number(req.params.id) });
    if (!paciente)
        return res.sendStatus(404);
    await em.removeAndFlush(paciente);
    res.sendStatus(204);
}
//# sourceMappingURL=paciente.controller.js.map