import { Request, Response } from "express";
import { orm } from "../../shared/orm.js";
import { Atencion } from "./Atencion.entity.js";
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";

const em = orm.em;

// GETALL - Para ver todos los turnos/atenciones
export async function findAll(req: Request, res: Response) {
  try {
    const atenciones = await em.find(
      Atencion,
      {},
      { populate: ["paciente", "medico", "medico.especialidad"] }
    );
    res.json(atenciones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// ADD - Para crear un nuevo turno (Solicitado por el cliente)
export async function add(req: Request, res: Response) {
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
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

// GET - Obtener turnos de un paciente específico
export async function findByPaciente(req: Request, res: Response) {
  try {
    const { idPaciente } = req.params;
    const atenciones = await em.find(
      Atencion,
      { paciente: { idPaciente: Number(idPaciente) } },
      { populate: ['medico', 'medico.especialidad'] }
    );
    res.json(atenciones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// PATCH - Cancelar turno si no ha pasado la fecha/hora
export async function cancelarTurno(req: Request, res: Response) {
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
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// GET - Turnos de un médico específico
export async function findByMedico(req: Request, res: Response) {
  try {
    const { matricula } = req.params;
    const atenciones = await em.find(
      Atencion,
      { medico: { matricula: Number(matricula) } },
      { populate: ['paciente'] }
    );
    res.json(atenciones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// PATCH - Cambiar estado (atendido / ausente / pendiente)
export async function cambiarEstado(req: Request, res: Response) {
  try {
    const { idAtencion } = req.params;
    const { estado } = req.body; // 'atendido' o 'ausente'

    const atencion = await em.findOne(Atencion, { idAtencion: Number(idAtencion) });
    if (!atencion) return res.status(404).json({ message: "Turno no encontrado" });

    atencion.estado = estado;
    await em.flush();

    res.json({ message: `Estado actualizado a ${estado}`, atencion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}