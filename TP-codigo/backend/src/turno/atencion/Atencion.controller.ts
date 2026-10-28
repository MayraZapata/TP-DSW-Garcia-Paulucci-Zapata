import { Request, Response } from "express";
import { orm } from "../../shared/orm.js";
import { Consulta } from "../consulta/Consulta.entity.js";
import { Urgencia } from "../urgencia/Urgencia.entity.js";
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js"; // Importado la entidad Diagnóstico
import { normalizarDni, validarDni, buscarPacientePorDni } from "../../usuarios/paciente/dni.js";

const em = orm.em;

// OJO: Atencion es la clase padre de Consulta (turnos) y Urgencia (guardia).
// Todo lo de TURNOS (reservar, agenda, mis turnos, reportes) trabaja con Consulta, así las urgencias
// (que no tienen horario de turno ni médico asignado al ingresar) nunca aparecen ni rompen esas pantallas.
// El Historial Clínico es la excepción: usa historialPorPaciente / historialPorDni (al final del archivo).

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
      estado: { $ne: "cancelado" },
    });

    if (turnoExistente) {
      return res.status(400).json({ message: "El médico ya posee un turno reservado en ese horario" });
    }

    // 5. Crear la nueva atención
    const nuevaAtencion = new Consulta();
    nuevaAtencion.fechaAtencion = new Date(`${fechaAtencion}T00:00:00`);
    nuevaAtencion.horaAtencion = horaAtencion;
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






// Función auxiliar para pasar a 'ausente' los turnos pendientes cuyo día ya terminó
async function actualizarTurnosVencidos() {
  try {
    const ahora = new Date();
    // Buscamos todas las atenciones pendientes
    const pendientes = await em.find(Consulta, { estado: 'pendiente' });

    for (const atencion of pendientes) {
      const fechaStr = atencion.fechaAtencion.toISOString().split("T")[0];

      // Fecha límite: 00:00:00 hs del día posterior al turno
      const fechaExpiracion = new Date(`${fechaStr}T00:00:00`);
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 1);

      // Recién pasa a ausente si ya cambió el día (ahora >= medianoche del día siguiente)
      if (ahora >= fechaExpiracion) {
        atencion.estado = "ausente";
      }
    }

    await em.flush(); // Guarda los cambios en la base de datos
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




// Obtener horarios ocupados de un médico en una fecha específica
export async function getHorariosOcupados(req: Request, res: Response) {
  try {
    const { matricula, fecha } = req.query;

    if (!matricula || !fecha) {
      return res.status(400).json({ message: "Se requiere matrícula y fecha." });
    }

    const atenciones = await em.find(
      Consulta,
      {
        medico: { matricula: Number(matricula) },
        fechaAtencion: new Date(`${fecha as string}T00:00:00`),
        estado: { $ne: "cancelado" }, // Los turnos cancelados liberan el horario
      },
      { fields: ["horaAtencion"] }
    );

    // Devolvemos solo una lista simple de strings: ["08:00", "09:30", ...]
    const horariosOcupados = atenciones.map((a) => a.horaAtencion);
    return res.json(horariosOcupados);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}






// ---------------------------------------------------------------------------
// HISTORIAL CLÍNICO
// Devuelve las atenciones de un paciente de TODOS los tipos: consultas (por turno) y
// urgencias (por guardia), de la más nueva a la más vieja. Cada una trae `tipoAtencion`
// ('consulta' o 'urgencia') para poder identificarla en pantalla.
// ---------------------------------------------------------------------------
async function armarHistorial(paciente: Paciente) {
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

  return [...consultas, ...urgencias].sort(
    (a, b) =>
      b.fechaAtencion.getTime() - a.fechaAtencion.getTime() ||
      b.horaAtencion.localeCompare(a.horaAtencion) ||
      b.idAtencion - a.idAtencion
  );
}

// Solo los datos del paciente que necesita la pantalla del historial (nunca usuario ni contraseña)
const datosBasicosPaciente = (p: Paciente) => ({
  idPaciente: p.idPaciente,
  nombre: p.nombre,
  apellido: p.apellido,
  dni: p.dni,
});

// Historial por id de paciente (lo usa el propio paciente; ADMIN y MEDICO también pueden)
export async function historialPorPaciente(req: Request, res: Response) {
  try {
    await actualizarTurnosVencidos();
    const paciente = await em.findOne(Paciente, { idPaciente: Number(req.params.idPaciente) });
    if (!paciente) {
      return res.status(404).json({ message: "El paciente indicado no existe" });
    }
    res.json({ paciente: datosBasicosPaciente(paciente), atenciones: await armarHistorial(paciente) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// Historial por DNI (ADMIN o MEDICO). El DNI se compara sin puntos ni espacios.
export async function historialPorDni(req: Request, res: Response) {
  try {
    const dni = normalizarDni(req.params.dni);
    const errorDni = validarDni(dni);
    if (errorDni) {
      return res.status(400).json({ message: errorDni });
    }

    await actualizarTurnosVencidos();
    const paciente = await buscarPacientePorDni(em, dni);
    if (!paciente) {
      return res.status(404).json({ message: `No existe un paciente con el DNI ${dni}` });
    }
    res.json({ paciente: datosBasicosPaciente(paciente), atenciones: await armarHistorial(paciente) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

