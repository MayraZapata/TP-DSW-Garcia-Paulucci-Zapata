import { orm } from "../../shared/orm.js";
import { ErrorNegocio } from "../../shared/errorNegocio.js";
import { Atencion } from "../atencion/Atencion.entity.js";
import { Consulta } from "./Consulta.entity.js";
import { Urgencia } from "../urgencia/Urgencia.entity.js";
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";
import { normalizarDni, validarDni, buscarPacientePorDni } from "../../shared/dni.js";

const em = orm.em;

// Función auxiliar para pasar a 'ausente' los turnos pendientes cuyo día ya terminó
export async function actualizarTurnosVencidos() {
  try {
    const ahora = new Date();
    const pendientes = await em.find(Consulta, { estado: 'pendiente' });

    for (const atencion of pendientes) {
      const fechaStr = atencion.fechaAtencion.toISOString().split("T")[0];
      const fechaExpiracion = new Date(`${fechaStr}T00:00:00`);
      fechaExpiracion.setDate(fechaExpiracion.getDate() + 1);

      if (ahora >= fechaExpiracion) {
        atencion.estado = "ausente";
      }
    }
    await em.flush();
  } catch (error) {
    console.error("Error al actualizar turnos vencidos:", error);
  }
}

// Listar todas las consultas (turnos)
export async function listar() {
  await actualizarTurnosVencidos();
  return em.find(
    Consulta,
    {},
    { populate: ["paciente", "medico", "medico.especialidad", "diagnostico"] }
  );
}

// Crear un nuevo turno (Consulta)
export async function crear(datosBody: any, auth: any) {
  const { matriculaMedico, fechaAtencion, horaAtencion } = datosBody;
  const idPaciente = auth?.rol === "PACIENTE" ? auth.id : datosBody.idPaciente;

  if (!idPaciente || !matriculaMedico || !fechaAtencion || !horaAtencion) {
    throw new ErrorNegocio(400, "Faltan datos requeridos para la reserva");
  }

  const paciente = await em.findOne(Paciente, { idPaciente: Number(idPaciente) });
  if (!paciente) {
    throw new ErrorNegocio(404, "El paciente indicado no existe");
  }

  const medico = await em.findOne(Medico, { matricula: Number(matriculaMedico) });
  if (!medico) {
    throw new ErrorNegocio(404, "El médico indicado no existe");
  }

  // Validar choque de turno
  const turnoExistente = await em.findOne(Consulta, {
    medico,
    fechaAtencion: new Date(`${fechaAtencion}T00:00:00`),
    horaAtencion,
    estado: { $ne: "cancelado" },
  });

  if (turnoExistente) {
    throw new ErrorNegocio(400, "El médico ya posee un turno reservado en ese horario");
  }

  const nuevaConsulta = new Consulta();
  nuevaConsulta.fechaAtencion = new Date(`${fechaAtencion}T00:00:00`);
  nuevaConsulta.horaAtencion = horaAtencion;
  nuevaConsulta.estado = "pendiente";
  nuevaConsulta.paciente = paciente;
  nuevaConsulta.medico = medico;

  await em.persistAndFlush(nuevaConsulta);

  return {
    message: "Turno reservado con éxito",
    atencion: nuevaConsulta,
  };
}

// Buscar turnos por paciente
export async function listarPorPaciente(idPaciente: number) {
  await actualizarTurnosVencidos();
  return em.find(
    Consulta,
    { paciente: { idPaciente: Number(idPaciente) } },
    { populate: ['medico', 'medico.especialidad', 'diagnostico'] }
  );
}

// Buscar turnos por médico
export async function listarPorMedico(matricula: number) {
  await actualizarTurnosVencidos();
  return em.find(
    Consulta,
    { medico: { matricula: Number(matricula) } },
    { populate: ['paciente', 'diagnostico'] }
  );
}

// Cancelar turno
export async function cancelar(idAtencion: number, auth: any) {
  const consulta = await em.findOne(Consulta, { idAtencion: Number(idAtencion) }, { populate: ['paciente'] });
  if (!consulta) {
    throw new ErrorNegocio(404, "El turno no existe");
  }
  if (consulta.paciente.idPaciente !== auth?.id) {
    throw new ErrorNegocio(403, "Ese turno no es tuyo");
  }

  const ahora = new Date();
  const fechaTurnoStr = consulta.fechaAtencion.toISOString().split('T')[0];
  const fechaHoraTurno = new Date(`${fechaTurnoStr}T${consulta.horaAtencion}`);

  if (fechaHoraTurno < ahora) {
    throw new ErrorNegocio(400, "No se puede cancelar un turno cuya fecha/hora ya transcurrió");
  }

  if (consulta.estado === 'cancelado') {
    throw new ErrorNegocio(400, "El turno ya se encuentra cancelado");
  }

  consulta.estado = "cancelado";
  await em.flush();

  return { message: "Turno cancelado con éxito", atencion: consulta };
}

// Cambiar estado (atendido / ausente)
export async function cambiarEstado(idAtencion: number, estado: string, auth: any) {
  const consulta = await em.findOne(Consulta, { idAtencion: Number(idAtencion) }, { populate: ['medico'] });
  if (!consulta) throw new ErrorNegocio(404, "Turno no encontrado");
  
  if (auth?.rol === "MEDICO" && consulta.medico.matricula !== auth.id) {
    throw new ErrorNegocio(403, "Ese turno pertenece a otro médico");
  }

  consulta.estado = estado;
  await em.flush();

  return { message: `Estado actualizado a ${estado}`, atencion: consulta };
}

// Completar con diagnóstico
export async function completarAtencion(idAtencion: number, idDiagnostico: number, estado: string, auth: any) {
  const consulta = await em.findOne(Consulta, { idAtencion: Number(idAtencion) }, { populate: ['medico'] });
  if (!consulta) {
    throw new ErrorNegocio(404, 'Atención no encontrada');
  }
  if (auth?.rol === "MEDICO" && consulta.medico.matricula !== auth.id) {
    throw new ErrorNegocio(403, "Ese turno pertenece a otro médico");
  }

  if (idDiagnostico) {
    const diagnostico = await em.findOne(Diagnostico, { idDiagnostico: Number(idDiagnostico) });
    if (!diagnostico) {
      throw new ErrorNegocio(404, 'Diagnóstico no encontrado');
    }
    consulta.diagnostico = diagnostico;
  }

  if (estado) {
    consulta.estado = estado;
  }

  await em.flush();
  return { message: 'Atención completada con diagnóstico exitosamente', atencion: consulta };
}

// Buscar turnos filtrando por fecha y/o médico
export async function buscar(query: any, auth: any) {
  await actualizarTurnosVencidos(); 
  const { fecha, matricula } = query;
  const filtro: any = {};

  if (fecha) {
    filtro.fechaAtencion = new Date(`${fecha as string}T00:00:00`);
  }

  if (matricula) {
    filtro.medico = { matricula: Number(matricula) };
  }

  if (auth?.rol === "MEDICO") {
    filtro.medico = { matricula: auth.id };
  }

  return em.find(
    Consulta,
    filtro,
    { populate: ['paciente', 'medico', 'medico.especialidad', 'diagnostico'] }
  );
}

// Obtener horarios ocupados
export async function obtenerHorariosOcupados(query: any) {
  const { matricula, fecha } = query;
  if (!matricula || !fecha) {
    throw new ErrorNegocio(400, "Se requiere matrícula y fecha.");
  }

  const consultas = await em.find(
    Consulta,
    {
      medico: { matricula: Number(matricula) },
      fechaAtencion: new Date(`${fecha as string}T00:00:00`),
      estado: { $ne: "cancelado" },
    },
    { fields: ["horaAtencion"] }
  );

  return consultas.map((a) => a.horaAtencion);
}

// Historial Clínico unificado
async function armarHistorial(paciente: Paciente) {
  const idPaciente = paciente.idPaciente;

  // Al consultar la entidad base Atencion con Single Table Inheritance (STI),
  // MikroORM resuelve en una sola consulta SQL todas las consultas y urgencias,
  // devolviendo instancias polimórficas (Consulta y Urgencia) según el discriminador.
  return em.find(
    Atencion,
    { paciente: { idPaciente } },
    {
      populate: ['medico', 'medico.especialidad', 'diagnostico', 'tipoUrgencia'],
      orderBy: { fechaAtencion: 'DESC', horaAtencion: 'DESC', idAtencion: 'DESC' },
    }
  );
}

const datosBasicosPaciente = (p: Paciente) => ({
  idPaciente: p.idPaciente,
  nombre: p.nombre,
  apellido: p.apellido,
  dni: p.dni,
});

export async function historialPorPaciente(idPaciente: number) {
  await actualizarTurnosVencidos();
  const paciente = await em.findOne(Paciente, { idPaciente: Number(idPaciente) });
  if (!paciente) {
    throw new ErrorNegocio(404, "El paciente indicado no existe");
  }
  return { paciente: datosBasicosPaciente(paciente), atenciones: await armarHistorial(paciente) };
}

export async function historialPorDni(dniRaw: string) {
  const dni = normalizarDni(dniRaw);
  const errorDni = validarDni(dni);
  if (errorDni) {
    throw new ErrorNegocio(400, errorDni);
  }

  await actualizarTurnosVencidos();
  const paciente = await buscarPacientePorDni(em, dni);
  if (!paciente) {
    throw new ErrorNegocio(404, `No existe un paciente con el DNI ${dni}`);
  }
  return { paciente: datosBasicosPaciente(paciente), atenciones: await armarHistorial(paciente) };
}
