import { Request, Response } from "express";
import { wrap } from "@mikro-orm/core";
import { orm } from "../../shared/orm.js";
import { Atencion } from "./Atencion.entity.js";
import { Consulta } from "./Consulta.entity.js";
import { Urgencia } from "../urgencia/Urgencia.entity.js";
import { normalizarDni, dniEsValido, buscarPacientePorDni, MENSAJE_DNI_INVALIDO } from "../../usuarios/paciente/dni.js";
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js"; // Importado la entidad Diagnóstico

const em = orm.em;

// Para ver todos los turnos/atenciones
export async function findAll(req: Request, res: Response) {
  try {
    await actualizarTurnosVencidos();
    const atenciones = await em.find(
      Consulta,
      {},
      { populate: ["paciente", "medico", "medico.especialidad", "diagnostico"] }
    );
    res.json(atenciones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}





// Para crear un nuevo turno (Solicitado por el cliente)
export async function add(req: Request, res: Response) {
  try {
    const { matriculaMedico, fechaAtencion, horaAtencion } = req.body;
    const idPaciente = req.auth!.rol === "PACIENTE" ? req.auth!.id : req.body.idPaciente;

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
    const turnoExistente = await em.findOne(Consulta, {
      medico,
      fechaAtencion: new Date(`${fechaAtencion}T00:00:00`),
      horaAtencion,
    });

    if (turnoExistente) {
      return res.status(400).json({ message: "El médico ya posee un turno reservado en ese horario" });
    }

    // 5. Crear la nueva atención
    const nuevaAtencion = new Consulta();
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





// Obtener turnos de un paciente específico
export async function findByPaciente(req: Request, res: Response) {
  try {
    await actualizarTurnosVencidos();
    const { idPaciente } = req.params;
    const atenciones = await em.find(
      Consulta,
      { paciente: { idPaciente: Number(idPaciente) } },
      { populate: ['medico', 'medico.especialidad', 'diagnostico'] }
    );
    res.json(atenciones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}






// Cancelar turno si no ha pasado la fecha/hora
export async function cancelarTurno(req: Request, res: Response) {
  try {
    const { idAtencion } = req.params;
    const atencion = await em.findOne(Consulta, { idAtencion: Number(idAtencion) });

    if (!atencion) {
      return res.status(404).json({ message: "El turno no existe" });
    }
    if (atencion.paciente.idPaciente !== req.auth!.id) {
      return res.status(403).json({ message: "Ese turno no es tuyo" });
    }

    // Validar si la fecha y hora ya pasaron
    const ahora = new Date();
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





// Turnos de un médico específico
export async function findByMedico(req: Request, res: Response) {
  try {
    await actualizarTurnosVencidos();
    const { matricula } = req.params;
    const atenciones = await em.find(
      Consulta,
      { medico: { matricula: Number(matricula) } },
      { populate: ['paciente', 'diagnostico'] }
    );
    res.json(atenciones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}






// Cambiar estado (atendido / ausente / pendiente)
export async function cambiarEstado(req: Request, res: Response) {
  try {
    const { idAtencion } = req.params;
    const { estado } = req.body; // 'atendido' o 'ausente'

    const atencion = await em.findOne(Consulta, { idAtencion: Number(idAtencion) });
    if (!atencion) return res.status(404).json({ message: "Turno no encontrado" });
    if (req.auth!.rol === "MEDICO" && atencion.medico.matricula !== req.auth!.id) {
      return res.status(403).json({ message: "Ese turno pertenece a otro médico" });
    }

    atencion.estado = estado;
    await em.flush();

    res.json({ message: `Estado actualizado a ${estado}`, atencion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}




// Asignar o actualizar el diagnóstico de una atención
export async function completarAtencion(req: Request, res: Response) {
  try {
    const { idAtencion } = req.params;
    const { idDiagnostico, estado } = req.body;

    const atencion = await em.findOne(Consulta, { idAtencion: Number(idAtencion) });
    if (!atencion) {
      return res.status(404).json({ message: 'Atención no encontrada' });
    }
    if (req.auth!.rol === "MEDICO" && atencion.medico.matricula !== req.auth!.id) {
      return res.status(403).json({ message: "Ese turno pertenece a otro médico" });
    }

    if (idDiagnostico) {
      const diagnostico = await em.findOne(Diagnostico, { idDiagnostico: Number(idDiagnostico) });
      if (!diagnostico) {
        return res.status(404).json({ message: 'Diagnóstico no encontrado' });
      }
      atencion.diagnostico = diagnostico;
    }

    if (estado) {
      atencion.estado = estado; // Ej: "atendido"
    }

    await em.flush();
    return res.status(200).json({ message: 'Atención completada con diagnóstico exitosamente', atencion });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}






// Función auxiliar para pasar a 'ausente' los turnos pendientes cuya fecha/hora ya pasó
async function actualizarTurnosVencidos() {
  try {
    const ahora = new Date();
    // Buscamos todas las atenciones pendientes
    const pendientes = await em.find(Consulta, { estado: 'pendiente' });

    for (const atencion of pendientes) {
      const fechaStr = atencion.fechaAtencion.toISOString().split('T')[0];
      const fechaHoraTurno = new Date(`${fechaStr}T${atencion.horaAtencion}`);

      if (fechaHoraTurno < ahora) {
        atencion.estado = 'ausente';
      }
    }
    await em.flush(); // Guarda los cambios masivamente en MySQL
  } catch (error) {
    console.error("Error al actualizar turnos vencidos:", error);
  }
}





// Buscar turnos filtrando por fecha y/o médico
export async function buscarTurnos(req: Request, res: Response) {
  try {
    await actualizarTurnosVencidos(); 

    const { fecha, matricula } = req.query;
    const filtro: any = {};

    if (fecha) {
      filtro.fechaAtencion = new Date(`${fecha as string}T00:00:00`);
    }

    if (matricula) {
      filtro.medico = { matricula: Number(matricula) };
    }

    if (req.auth!.rol === "MEDICO") {
      filtro.medico = { matricula: req.auth!.id }; // un médico solo ve sus turnos
    }

    const atenciones = await em.find(
      Consulta,
      filtro,
      { populate: ['paciente', 'medico', 'medico.especialidad', 'diagnostico'] }
    );

    res.json(atenciones);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}





// ---------------------------------------------------------------------------
// HISTORIAL CLÍNICO
// A diferencia del resto de este archivo (que trabaja solo con Consulta = turnos),
// el historial junta TODAS las atenciones del paciente: turnos y urgencias.
// Cada una viaja con `tipoAtencion` ("consulta" | "urgencia") para identificarla en pantalla.
// ---------------------------------------------------------------------------
async function armarHistorial(paciente: Paciente) {
  await actualizarTurnosVencidos();

  const consultas = await em.find(
    Consulta,
    { paciente },
    { populate: ['medico', 'medico.especialidad', 'diagnostico'] }
  );
  const urgencias = await em.find(
    Urgencia,
    { paciente },
    { populate: ['medico', 'medico.especialidad', 'diagnostico', 'tipoUrgencia'] }
  );

  // De la más reciente a la más antigua (fecha, hora y, si empatan, el orden de carga)
  const todas: Atencion[] = [...consultas, ...urgencias].sort((a, b) =>
    b.fechaAtencion.getTime() - a.fechaAtencion.getTime() ||
    (a.horaAtencion < b.horaAtencion ? 1 : a.horaAtencion > b.horaAtencion ? -1 : 0) ||
    b.idAtencion - a.idAtencion
  );

  return {
    paciente: {
      idPaciente: paciente.idPaciente,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
    },
    atenciones: todas.map((a) => wrap(a).toJSON()),
  };
}

// Historial de un paciente por su id (lo usa el propio paciente; admin y médico también pueden)
export async function historialPorPaciente(req: Request, res: Response) {
  try {
    const paciente = await em.findOne(Paciente, { idPaciente: Number(req.params.idPaciente) });
    if (!paciente) return res.status(404).json({ message: "El paciente indicado no existe" });

    res.json(await armarHistorial(paciente));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Historial buscando por DNI (admin y médico). El DNI se compara sin puntos ni espacios en el servidor.
export async function historialPorDni(req: Request, res: Response) {
  try {
    const dni = normalizarDni(req.params.dni);
    if (!dniEsValido(dni)) return res.status(400).json({ message: MENSAJE_DNI_INVALIDO });

    const paciente = await buscarPacientePorDni(dni);
    if (!paciente) return res.status(404).json({ message: "No hay ningún paciente registrado con ese DNI" });

    res.json(await armarHistorial(paciente));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
