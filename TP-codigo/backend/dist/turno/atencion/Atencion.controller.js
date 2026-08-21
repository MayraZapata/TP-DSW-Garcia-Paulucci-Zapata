import { orm } from "../../shared/orm.js";
import { Atencion } from "./Atencion.entity.js";
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
const em = orm.em;
// Para ver todos los turnos/atenciones
export async function findAll(req, res) {
    try {
        await actualizarTurnosVencidos();
        const atenciones = await em.find(Atencion, {}, { populate: ["paciente", "medico", "medico.especialidad"] });
        res.json(atenciones);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Para crear un nuevo turno (Solicitado por el cliente)
export async function add(req, res) {
    try {
        const { idPaciente, matriculaMedico, fechaAtencion, horaAtencion } = req.body;
        // 1. Validar que vengan los datos obligatorios
        if (!idPaciente || !matriculaMedico || !fechaAtencion || !horaAtencion) {
            return res.status(400).json({ message: "Faltan datos requeridos para la reserva" });
        }
        // 2. Verificar que exista el paciente
        const paciente = await em.findOne(Paciente, { idPaciente: Number(idPaciente) });
        if (!paciente) {
            return res.status(404).json({ message: "El paciente indicado no existe" });
        }
        // 3. Verificar que exista el médico
        const medico = await em.findOne(Medico, { matricula: Number(matriculaMedico) });
        if (!medico) {
            return res.status(404).json({ message: "El médico indicado no existe" });
        }
        // 4. Validar que el médico NO tenga un turno ocupado en esa misma fecha y hora
        const turnoExistente = await em.findOne(Atencion, {
            medico,
            fechaAtencion: new Date(`${fechaAtencion}T00:00:00`),
            horaAtencion,
        });
        if (turnoExistente) {
            return res.status(400).json({ message: "El médico ya posee un turno reservado en ese horario" });
        }
        // 5. Crear la nueva atención
        const nuevaAtencion = new Atencion();
        nuevaAtencion.fechaAtencion = new Date(`${fechaAtencion}T00:00:00`);
        nuevaAtencion.horaAtencion = horaAtencion;
        nuevaAtencion.nroIngreso = Math.floor(100000 + Math.random() * 900000);
        nuevaAtencion.estado = "pendiente";
        nuevaAtencion.paciente = paciente;
        nuevaAtencion.medico = medico;
        await em.persistAndFlush(nuevaAtencion);
        return res.status(201).json({
            message: "Turno reservado con éxito",
            atencion: nuevaAtencion,
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
// Obtener turnos de un paciente específico
export async function findByPaciente(req, res) {
    try {
        await actualizarTurnosVencidos();
        const { idPaciente } = req.params;
        const atenciones = await em.find(Atencion, { paciente: { idPaciente: Number(idPaciente) } }, { populate: ['medico', 'medico.especialidad'] });
        res.json(atenciones);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Cancelar turno si no ha pasado la fecha/hora
export async function cancelarTurno(req, res) {
    try {
        const { idAtencion } = req.params;
        const atencion = await em.findOne(Atencion, { idAtencion: Number(idAtencion) });
        if (!atencion) {
            return res.status(404).json({ message: "El turno no existe" });
        }
        // Validar si la fecha y hora ya pasaron
        const ahora = new Date();
        // Armamos un objeto Date con la fecha y hora del turno
        const fechaTurnoStr = atencion.fechaAtencion.toISOString().split('T')[0];
        const fechaHoraTurno = new Date(`${fechaTurnoStr}T${atencion.horaAtencion}`);
        if (fechaHoraTurno < ahora) {
            return res.status(400).json({ message: "No se puede cancelar un turno cuya fecha/hora ya transcurrió" });
        }
        if (atencion.estado === 'cancelado') {
            return res.status(400).json({ message: "El turno ya se encuentra cancelado" });
        }
        atencion.estado = "cancelado";
        await em.flush();
        res.json({ message: "Turno cancelado con éxito", atencion });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Turnos de un médico específico
export async function findByMedico(req, res) {
    try {
        await actualizarTurnosVencidos();
        const { matricula } = req.params;
        const atenciones = await em.find(Atencion, { medico: { matricula: Number(matricula) } }, { populate: ['paciente'] });
        res.json(atenciones);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Cambiar estado (atendido / ausente / pendiente)
export async function cambiarEstado(req, res) {
    try {
        const { idAtencion } = req.params;
        const { estado } = req.body; // 'atendido' o 'ausente'
        const atencion = await em.findOne(Atencion, { idAtencion: Number(idAtencion) });
        if (!atencion)
            return res.status(404).json({ message: "Turno no encontrado" });
        atencion.estado = estado;
        await em.flush();
        res.json({ message: `Estado actualizado a ${estado}`, atencion });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// Función auxiliar para pasar a 'ausente' los turnos pendientes cuya fecha/hora ya pasó
async function actualizarTurnosVencidos() {
    try {
        const ahora = new Date();
        // Buscamos todas las atenciones pendientes
        const pendientes = await em.find(Atencion, { estado: 'pendiente' });
        for (const atencion of pendientes) {
            const fechaStr = atencion.fechaAtencion.toISOString().split('T')[0];
            const fechaHoraTurno = new Date(`${fechaStr}T${atencion.horaAtencion}`);
            if (fechaHoraTurno < ahora) {
                atencion.estado = 'ausente';
            }
        }
        await em.flush(); // Guarda los cambios masivamente en MySQL
    }
    catch (error) {
        console.error("Error al actualizar turnos vencidos:", error);
    }
}
// Buscar turnos filtrando por fecha y/o médico
export async function buscarTurnos(req, res) {
    try {
        await actualizarTurnosVencidos();
        const { fecha, matricula } = req.query;
        const filtro = {};
        if (fecha) {
            filtro.fechaAtencion = new Date(`${fecha}T00:00:00`);
        }
        if (matricula) {
            filtro.medico = { matricula: Number(matricula) };
        }
        const atenciones = await em.find(Atencion, filtro, { populate: ['paciente', 'medico', 'medico.especialidad'] });
        res.json(atenciones);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//# sourceMappingURL=Atencion.controller.js.map