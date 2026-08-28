import { orm } from "../../shared/orm.js";
import { Diagnostico } from "./diagnostico.entity.js";
const em = orm.em;
// Diagnostico es una entidad "simple": no tiene relaciones con otras entidades
// (es Atencion la que la referencia a ella), por eso el CRUD es igual de directo
// que el de Especialidad u ObraSocial, sin necesidad de resolver claves foráneas.
//GETALL
//Equivalente - SELECT * FROM diagnostico;
export async function findAll(req, res) {
    const diagnosticos = await em.find(Diagnostico, {});
    res.json(diagnosticos);
}
//GETONE
//Equivalente - SELECT * FROM diagnostico WHERE idDiagnostico = ?
export async function findOne(req, res) {
    const diagnostico = await em.findOne(Diagnostico, { idDiagnostico: Number(req.params.id) });
    if (!diagnostico) {
        return res.status(404).json({ message: "Diagnostico inexistente" });
    }
    res.json(diagnostico);
}
//ADD
//Crear y guardar un nuevo diagnostico en la base de datos
export async function add(req, res) {
    const nombreDiagnostico = req.body.nombreDiagnostico?.trim();
    // Evitar cargar dos veces el mismo diagnóstico como filas distintas del catálogo
    // (esto NO limita que un paciente tenga el mismo diagnóstico en varias Atenciones)
    const existente = await em.findOne(Diagnostico, { nombreDiagnostico });
    if (existente) {
        return res.status(400).json({ message: "Ya existe un diagnóstico con ese nombre" });
    }
    // em.create arma la entidad en memoria a partir del body (nombreDiagnostico, tratamiento)
    // y persistAndFlush la inserta efectivamente en la base de datos
    const diagnostico = em.create(Diagnostico, { ...req.body, nombreDiagnostico });
    await em.persistAndFlush(diagnostico);
    res.status(201).json(diagnostico);
}
//UPDATE
//Actualizar un diagnostico existente en la base de datos
export async function update(req, res) {
    const diagnostico = await em.findOne(Diagnostico, { idDiagnostico: Number(req.params.id) });
    if (!diagnostico)
        return res.status(404).json({ message: "Diagnostico inexistente" });
    // Si se está cambiando el nombre, chequear que no choque con otro diagnóstico ya cargado
    if (req.body.nombreDiagnostico) {
        const nombreDiagnostico = req.body.nombreDiagnostico.trim();
        const existente = await em.findOne(Diagnostico, { nombreDiagnostico });
        if (existente && existente.idDiagnostico !== diagnostico.idDiagnostico) {
            return res.status(400).json({ message: "Ya existe otro diagnóstico con ese nombre" });
        }
        req.body.nombreDiagnostico = nombreDiagnostico;
    }
    // em.assign copia sobre la entidad ya encontrada los campos que vengan en el body
    em.assign(diagnostico, req.body);
    await em.flush();
    res.json(diagnostico);
}
//DELETE
//Eliminar un diagnostico existente en la base de datos
export async function remove(req, res) {
    const diagnostico = await em.findOne(Diagnostico, { idDiagnostico: Number(req.params.id) });
    if (!diagnostico)
        return res.status(404).json({ message: "Diagnostico inexistente" });
    await em.removeAndFlush(diagnostico);
    res.status(204).json({ message: "Diagnostico eliminado" });
}
//# sourceMappingURL=diagnostico.controller.js.map