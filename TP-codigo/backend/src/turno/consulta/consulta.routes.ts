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
} from "./consulta.controller.js";
import { autenticar, autorizar, soloPropio } from "../../shared/auth.middleware.js";

export const consultaRouter = Router();

const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];

/**
 * @openapi
 * components:
 *   schemas:
 *     Consulta:
 *       type: object
 *       description: Atención por turno. Hija de Atencion (se guarda en la misma tabla que las urgencias).
 *       properties:
 *         idAtencion:
 *           type: integer
 *           example: 5
 *         tipoAtencion:
 *           type: string
 *           enum: [consulta]
 *           example: consulta
 *         fechaAtencion:
 *           type: string
 *           format: date-time
 *           example: "2026-11-05T00:00:00.000Z"
 *         horaAtencion:
 *           type: string
 *           example: "10:30:00"
 *         estado:
 *           type: string
 *           enum: [pendiente, atendido, ausente, cancelado]
 *           description: Los turnos pendientes de días anteriores pasan solos a "ausente"
 *           example: pendiente
 *         paciente:
 *           $ref: '#/components/schemas/Paciente'
 *         medico:
 *           $ref: '#/components/schemas/Medico'
 *         diagnostico:
 *           nullable: true
 *           description: Queda vacío hasta que el médico completa la atención
 *           allOf:
 *             - $ref: '#/components/schemas/Diagnostico'
 *     ReservaTurno:
 *       type: object
 *       required: [matriculaMedico, fechaAtencion, horaAtencion]
 *       properties:
 *         matriculaMedico:
 *           type: integer
 *           description: Matrícula del médico elegido
 *           example: 1001
 *         fechaAtencion:
 *           type: string
 *           format: date
 *           example: "2026-11-05"
 *         horaAtencion:
 *           type: string
 *           example: "10:30:00"
 *         idPaciente:
 *           type: integer
 *           description: Obligatorio solo si quien reserva es ADMIN. Si reserva un PACIENTE se toma el de su sesión.
 *           example: 1
 *     CambioEstado:
 *       type: object
 *       required: [estado]
 *       properties:
 *         estado:
 *           type: string
 *           enum: [pendiente, atendido, ausente, cancelado]
 *           example: atendido
 *     CompletarAtencion:
 *       type: object
 *       description: Se puede mandar el diagnóstico, el estado, o los dos
 *       properties:
 *         idDiagnostico:
 *           type: integer
 *           description: Un diagnóstico ya cargado
 *           example: 1
 *         estado:
 *           type: string
 *           enum: [pendiente, atendido, ausente, cancelado]
 *           example: atendido
 *     MensajeConConsulta:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Turno reservado con éxito
 *         atencion:
 *           $ref: '#/components/schemas/Consulta'
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
 *               example: Ana
 *             apellido:
 *               type: string
 *               example: Gómez
 *             dni:
 *               type: string
 *               example: "30123456"
 *         atenciones:
 *           type: array
 *           description: Consultas y urgencias juntas, de la más nueva a la más vieja
 *           items:
 *             oneOf:
 *               - $ref: '#/components/schemas/Consulta'
 *               - $ref: '#/components/schemas/Urgencia'
 */

/**
 * @openapi
 * /consultas:
 *   get:
 *     tags: [Atenciones]
 *     summary: Listar todos los turnos
 *     description: ADMIN o MEDICO.
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
 *                 $ref: '#/components/schemas/Consulta'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *   post:
 *     tags: [Atenciones]
 *     summary: Reservar un turno
 *     description: ADMIN o PACIENTE. No permite dos turnos del mismo médico en el mismo día y hora.
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
 *               $ref: '#/components/schemas/MensajeConConsulta'
 *       400:
 *         description: Faltan datos, o el médico ya tiene un turno en ese horario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: El paciente o el médico indicado no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
consultaRouter.get("/", adminOMedico, findAll);
consultaRouter.post("/", [autenticar, autorizar("ADMIN", "PACIENTE")], add);

/**
 * @openapi
 * /consultas/horarios-ocupados:
 *   get:
 *     tags: [Atenciones]
 *     summary: Horarios ocupados de un médico en una fecha
 *     description: ADMIN o PACIENTE. Sirve para mostrar qué horas ya no se pueden reservar (no cuenta los turnos cancelados).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: matricula
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1001
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-11-05"
 *     responses:
 *       200:
 *         description: Horas ocupadas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: "10:30:00"
 *       400:
 *         description: Falta la matrícula o la fecha
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
consultaRouter.get("/horarios-ocupados", [autenticar, autorizar("ADMIN", "PACIENTE")], getHorariosOcupados);

/**
 * @openapi
 * /consultas/paciente/{idPaciente}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Turnos de un paciente
 *     description: ADMIN, MEDICO, o el propio paciente.
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
 *                 $ref: '#/components/schemas/Consulta'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
consultaRouter.get("/paciente/:idPaciente", [autenticar, autorizar("ADMIN", "MEDICO", "PACIENTE"), soloPropio("PACIENTE", "idPaciente")], findByPaciente);

/**
 * @openapi
 * /consultas/medico/{matricula}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Turnos de un médico
 *     description: ADMIN, o el propio médico.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: matricula
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1001
 *     responses:
 *       200:
 *         description: Turnos del médico
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consulta'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
consultaRouter.get("/medico/:matricula", [autenticar, autorizar("ADMIN", "MEDICO"), soloPropio("MEDICO", "matricula")], findByMedico);

/**
 * @openapi
 * /consultas/{idAtencion}/cancelar:
 *   patch:
 *     tags: [Atenciones]
 *     summary: Cancelar un turno
 *     description: Solo PACIENTE, y solo un turno propio que todavía no pasó y no esté cancelado.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *     responses:
 *       200:
 *         description: Turno cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConConsulta'
 *       400:
 *         description: El turno ya pasó o ya estaba cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: El rol no tiene permiso, o el turno es de otro paciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
consultaRouter.patch("/:idAtencion/cancelar", [autenticar, autorizar("PACIENTE")], cancelarTurno);

/**
 * @openapi
 * /consultas/{idAtencion}/estado:
 *   patch:
 *     tags: [Atenciones]
 *     summary: Cambiar el estado de un turno
 *     description: ADMIN, o el médico dueño del turno (por ejemplo, para marcarlo como atendido o ausente).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
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
 *               $ref: '#/components/schemas/MensajeConConsulta'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: El rol no tiene permiso, o el turno pertenece a otro médico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
consultaRouter.patch("/:idAtencion/estado", adminOMedico, cambiarEstado);

/**
 * @openapi
 * /consultas/{idAtencion}/diagnostico:
 *   patch:
 *     tags: [Atenciones]
 *     summary: Completar una atención con su diagnóstico
 *     description: ADMIN, o el médico dueño del turno. Asigna un diagnóstico ya cargado y/o cambia el estado.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
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
 *               $ref: '#/components/schemas/MensajeConConsulta'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: El rol no tiene permiso, o el turno pertenece a otro médico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: La atención o el diagnóstico indicado no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
consultaRouter.patch("/:idAtencion/diagnostico", adminOMedico, completarAtencion);

/**
 * @openapi
 * /consultas/buscar:
 *   get:
 *     tags: [Atenciones]
 *     summary: Buscar turnos por fecha y/o médico
 *     description: ADMIN o MEDICO. Los dos filtros son opcionales. Si quien busca es un MEDICO, siempre se filtra por su propia matrícula.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-11-05"
 *       - in: query
 *         name: matricula
 *         required: false
 *         schema:
 *           type: integer
 *         example: 1001
 *     responses:
 *       200:
 *         description: Turnos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Consulta'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
consultaRouter.get("/buscar", adminOMedico, buscarTurnos);

/**
 * @openapi
 * /consultas/historial/paciente/{idPaciente}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Historial clínico de un paciente
 *     description: ADMIN, MEDICO, o el propio paciente. Junta consultas y urgencias en una sola lista.
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
 *         description: Historial del paciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HistorialClinico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
consultaRouter.get("/historial/paciente/:idPaciente", [autenticar, autorizar("ADMIN", "MEDICO", "PACIENTE"), soloPropio("PACIENTE", "idPaciente")], historialPorPaciente);

/**
 * @openapi
 * /consultas/historial/dni/{dni}:
 *   get:
 *     tags: [Atenciones]
 *     summary: Historial clínico de un paciente por DNI
 *     description: ADMIN o MEDICO. Ignora puntos y espacios ("47.076.568" es igual a "47076568").
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *         example: "47.076.568"
 *     responses:
 *       200:
 *         description: Historial del paciente
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
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
consultaRouter.get("/historial/dni/:dni", adminOMedico, historialPorDni);