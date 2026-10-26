import { Router } from "express";
import {
  findAll,
  add,
  findByPaciente,
  findByMedico,
  cancelarTurno,
  cambiarEstado,
  buscarTurnos,
  completarAtencion,
  getHorariosOcupados,
  historialPorPaciente,
  historialPorDni
} from "./Atencion.controller.js";
import { autenticar, autorizar, soloPropio } from "../../shared/auth.middleware.js";

export const atencionRouter = Router();

const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];

/**
 * @openapi
 * components:
 *   schemas:
 *     Atencion:
 *       type: object
 *       properties:
 *         idAtencion:
 *           type: integer
 *           example: 1
 *         fechaAtencion:
 *           type: string
 *           format: date-time
 *           example: "2026-10-20T00:00:00.000Z"
 *         horaAtencion:
 *           type: string
 *           example: "09:30"
 *         estado:
 *           type: string
 *           enum: [pendiente, atendido, ausente, cancelado]
 *           example: pendiente
 *         paciente:
 *           $ref: '#/components/schemas/Paciente'
 *         medico:
 *           $ref: '#/components/schemas/Medico'
 *         diagnostico:
 *           nullable: true
 *           allOf:
 *             - $ref: '#/components/schemas/Diagnostico'
 *     ReservaTurno:
 *       type: object
 *       required: [matriculaMedico, fechaAtencion, horaAtencion]
 *       properties:
 *         matriculaMedico:
 *           type: integer
 *           example: 12345
 *         fechaAtencion:
 *           type: string
 *           format: date
 *           example: "2026-10-20"
 *         horaAtencion:
 *           type: string
 *           example: "09:30"
 *         idPaciente:
 *           type: integer
 *           description: Solo lo usa el ADMIN. Si reserva un PACIENTE se toma de su sesión.
 *     CambioEstado:
 *       type: object
 *       required: [estado]
 *       properties:
 *         estado:
 *           type: string
 *           enum: [pendiente, atendido, ausente]
 *     CompletarAtencion:
 *       type: object
 *       properties:
 *         idDiagnostico:
 *           type: integer
 *           description: Diagnóstico a asignar (opcional)
 *         estado:
 *           type: string
 *           description: Nuevo estado (opcional)
 *           example: atendido
 *     MensajeConAtencion:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         atencion:
 *           $ref: '#/components/schemas/Atencion'
 */

/**
 * @openapi
 * /atenciones:
 *   get:
 *     tags: [Atenciones]
 *     summary: Listar todos los turnos
 *     description: ADMIN o MEDICO. Antes de responder, marca como ausentes los turnos pendientes cuya fecha ya pasó.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de turnos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Atencion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *   post:
 *     tags: [Atenciones]
 *     summary: Reservar un turno
 *     description: ADMIN o PACIENTE. El médico no puede tener otro turno en la misma fecha y hora.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservaTurno'
 *     responses:
 *       201:
 *         description: Turno reservado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConAtencion'
 *       400:
 *         description: Faltan datos o el médico ya tiene un turno en ese horario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: El paciente o el médico no existen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
atencionRouter.get("/", adminOMedico, findAll);
atencionRouter.post("/", [autenticar, autorizar("ADMIN", "PACIENTE")], add);

/**
 * @openapi
 * /atenciones/paciente/{idPaciente}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Turnos de un paciente
 *     description: ADMIN, MEDICO, o el propio paciente (no puede ver los de otro).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idPaciente
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Turnos del paciente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Atencion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
atencionRouter.get("/paciente/:idPaciente",[autenticar, autorizar("ADMIN", "MEDICO", "PACIENTE"), soloPropio("PACIENTE", "idPaciente")],findByPaciente);

/**
 * @openapi
 * /atenciones/medico/{matricula}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Turnos de un médico
 *     description: ADMIN, o el propio médico (no puede ver los de otro).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: matricula
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12345
 *     responses:
 *       200:
 *         description: Turnos del médico
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Atencion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
atencionRouter.get("/medico/:matricula",[autenticar, autorizar("ADMIN", "MEDICO"), soloPropio("MEDICO", "matricula")],findByMedico);

/**
 * @openapi
 * /atenciones/{idAtencion}/cancelar:
 *   patch:
 *     tags: [Atenciones]
 *     summary: Cancelar un turno
 *     description: Solo PACIENTE, y solo su propio turno. No se puede cancelar si la fecha y hora ya pasaron.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Turno cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConAtencion'
 *       400:
 *         description: El turno ya pasó o ya estaba cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */


atencionRouter.get("/horarios-ocupados", [autenticar, autorizar("ADMIN", "PACIENTE")], getHorariosOcupados);


atencionRouter.patch("/:idAtencion/cancelar", [autenticar, autorizar("PACIENTE")], cancelarTurno);

/**
 * @openapi
 * /atenciones/{idAtencion}/estado:
 *   patch:
 *     tags: [Atenciones]
 *     summary: Cambiar el estado de un turno
 *     description: ADMIN o MEDICO (un médico solo puede tocar sus propios turnos).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambioEstado'
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConAtencion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
atencionRouter.patch("/:idAtencion/estado", adminOMedico, cambiarEstado);

/**
 * @openapi
 * /atenciones/{idAtencion}/diagnostico:
 *   patch:
 *     tags: [Atenciones]
 *     summary: Completar una atención con su diagnóstico
 *     description: ADMIN o MEDICO (un médico solo puede tocar sus propios turnos). Asigna el diagnóstico y/o cambia el estado.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompletarAtencion'
 *     responses:
 *       200:
 *         description: Atención completada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConAtencion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: La atención o el diagnóstico no existen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
atencionRouter.patch("/:idAtencion/diagnostico", adminOMedico, completarAtencion);

/**
 * @openapi
 * /atenciones/buscar:
 *   get:
 *     tags: [Atenciones]
 *     summary: Buscar turnos por fecha y/o médico
 *     description: ADMIN o MEDICO. Si quien consulta es un médico, solo ve sus propios turnos.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-10-20"
 *       - in: query
 *         name: matricula
 *         schema:
 *           type: integer
 *         example: 12345
 *     responses:
 *       200:
 *         description: Turnos que cumplen el filtro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Atencion'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
atencionRouter.get("/buscar", adminOMedico, buscarTurnos);

/**
 * @openapi
 * /atenciones/historial/paciente/{idPaciente}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Historial clínico de un paciente (por id)
 *     description: >
 *       ADMIN, MEDICO, o el propio paciente (no puede ver el de otro).
 *       A diferencia de /atenciones/paciente/{idPaciente} (que solo trae turnos), acá vienen
 *       TAMBIÉN las urgencias de guardia, identificadas con tipoAtencion = urgencia.
 *       Ordenadas de la más nueva a la más vieja.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idPaciente
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos básicos del paciente y todas sus atenciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistorialClinico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: El paciente no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
atencionRouter.get("/historial/paciente/:idPaciente", [autenticar, autorizar("ADMIN", "MEDICO", "PACIENTE"), soloPropio("PACIENTE", "idPaciente")], historialPorPaciente);

/**
 * @openapi
 * /atenciones/historial/dni/{dni}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Historial clínico de un paciente (por DNI)
 *     description: >
 *       ADMIN o MEDICO. El DNI se compara sin puntos ni espacios ("47.076.568" es igual a "47076568").
 *       Incluye consultas y urgencias.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *         example: "47076568"
 *     responses:
 *       200:
 *         description: Datos básicos del paciente y todas sus atenciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistorialClinico'
 *       400:
 *         description: DNI con formato inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: No existe un paciente con ese DNI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
atencionRouter.get("/historial/dni/:dni", adminOMedico, historialPorDni);

/**
 * @openapi
 * components:
 *   schemas:
 *     HistorialClinico:
 *       type: object
 *       properties:
 *         paciente:
 *           type: object
 *           properties:
 *             idPaciente:
 *               type: integer
 *               example: 1
 *             nombre:
 *               type: string
 *               example: Juan
 *             apellido:
 *               type: string
 *               example: Perez
 *             dni:
 *               type: string
 *               example: "47076568"
 *         atenciones:
 *           type: array
 *           description: Consultas (tipoAtencion = consulta) y urgencias (tipoAtencion = urgencia)
 *           items:
 *             oneOf:
 *               - $ref: '#/components/schemas/Atencion'
 *               - $ref: '#/components/schemas/Urgencia'
 */
