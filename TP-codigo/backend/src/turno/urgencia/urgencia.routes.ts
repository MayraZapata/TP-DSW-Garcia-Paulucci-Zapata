import { Router } from "express";
import { guardia, findAll, findOne, add, update, atender, finalizar, cancelar } from "./urgencia.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const urgenciaRouter = Router();

const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];
const soloAdmin = [autenticar, autorizar("ADMIN")];
const soloMedico = [autenticar, autorizar("MEDICO")];

/**
 * @openapi
 * components:
 *   schemas:
 *     Urgencia:
 *       type: object
 *       description: Atención por guardia. Hija de Atencion (se guarda en la misma tabla que las consultas).
 *       properties:
 *         idAtencion:
 *           type: integer
 *           example: 12
 *         tipoAtencion:
 *           type: string
 *           enum: [urgencia]
 *           example: urgencia
 *         fechaAtencion:
 *           type: string
 *           format: date-time
 *           description: Día de llegada (lo pone el servidor)
 *           example: "2026-10-19T00:00:00.000Z"
 *         horaAtencion:
 *           type: string
 *           description: Hora de llegada (la pone el servidor)
 *           example: "14:32:05"
 *         nroIngreso:
 *           type: integer
 *           example: 483920
 *         estado:
 *           type: string
 *           enum: [en_espera, en_atencion, finalizada, cancelada]
 *           example: en_espera
 *         prioridad:
 *           type: string
 *           enum: [rojo, amarillo, verde]
 *           description: La decide una persona (rojo = inmediata, amarillo = intermedia, verde = puede esperar)
 *           example: rojo
 *         motivo:
 *           type: string
 *           example: Corte profundo en el antebrazo
 *         detalleTipo:
 *           type: string
 *           nullable: true
 *           description: Descripción opcional. Solo tiene valor cuando el tipo de urgencia es "Otro"
 *           example: Picadura de insecto con hinchazón
 *         paciente:
 *           $ref: '#/components/schemas/Paciente'
 *         tipoUrgencia:
 *           $ref: '#/components/schemas/TipoUrgencia'
 *         medico:
 *           nullable: true
 *           description: Queda vacío hasta que un médico toma al paciente
 *           allOf:
 *             - $ref: '#/components/schemas/Medico'
 *         diagnostico:
 *           nullable: true
 *           allOf:
 *             - $ref: '#/components/schemas/Diagnostico'
 *     IngresoUrgencia:
 *       type: object
 *       required: [dni, motivo, idTipo, prioridad]
 *       properties:
 *         dni:
 *           type: string
 *           description: Con o sin puntos y espacios
 *           example: "47.076.568"
 *         motivo:
 *           type: string
 *           example: Corte profundo en el antebrazo
 *         detalleTipo:
 *           type: string
 *           description: Opcional. Solo se guarda si el tipo de urgencia es "Otro" (máximo 150 caracteres); con otro tipo se ignora
 *           example: Picadura de insecto con hinchazón
 *         idTipo:
 *           type: integer
 *           description: Tipo de urgencia (tabla TipoUrgencia)
 *           example: 2
 *         prioridad:
 *           type: string
 *           enum: [rojo, amarillo, verde]
 *           example: rojo
 *         nombre:
 *           type: string
 *           description: Obligatorio solo si el DNI NO está registrado (se registra al paciente en el momento)
 *           example: Ana
 *         apellido:
 *           type: string
 *           description: Obligatorio solo si el DNI NO está registrado
 *           example: Gómez
 *         idObra:
 *           type: integer
 *           nullable: true
 *           description: Obra social (opcional; solo se usa si el DNI NO está registrado)
 *           example: 1
 *     EditarUrgencia:
 *       type: object
 *       description: Cualquiera de estos campos (solo mientras la urgencia está en espera)
 *       properties:
 *         motivo:
 *           type: string
 *         detalleTipo:
 *           type: string
 *           description: Solo tiene efecto si el tipo resultante es "Otro". Si se cambia a otro tipo, la descripción se borra sola
 *         idTipo:
 *           type: integer
 *         prioridad:
 *           type: string
 *           enum: [rojo, amarillo, verde]
 *     FinalizarUrgencia:
 *       type: object
 *       description: Hay que mandar UNA de las dos opciones (idDiagnostico o nuevoDiagnostico)
 *       properties:
 *         idDiagnostico:
 *           type: integer
 *           description: Un diagnóstico ya cargado
 *           example: 1
 *         nuevoDiagnostico:
 *           type: object
 *           description: Un diagnóstico nuevo, que queda guardado para otras atenciones (el nombre no puede repetirse)
 *           required: [nombreDiagnostico]
 *           properties:
 *             nombreDiagnostico:
 *               type: string
 *               example: Herida cortante
 *             tratamiento:
 *               type: string
 *               example: Sutura y curaciones cada 48 horas
 *     MensajeConUrgencia:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         pacienteNuevo:
 *           type: boolean
 *           description: Solo al ingresar. true si se registró al paciente en ese momento
 *         urgencia:
 *           $ref: '#/components/schemas/Urgencia'
 */

/**
 * @openapi
 * /urgencias/guardia:
 *   get:
 *     tags: [Urgencias]
 *     summary: Lista de la guardia (espera ordenada + en atención)
 *     description: >
 *       ADMIN o MEDICO. Primero viene la lista de espera ordenada por prioridad (rojo, amarillo, verde)
 *       y, dentro de cada una, por hora de llegada; el primero es el próximo a atender.
 *       Después vienen los pacientes en atención. La pantalla la consulta cada pocos segundos.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Urgencias en espera (ordenadas) y en atención
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Urgencia'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
urgenciaRouter.get("/guardia", adminOMedico, guardia);

/**
 * @openapi
 * /urgencias:
 *   get:
 *     tags: [Urgencias]
 *     summary: Listar todas las urgencias
 *     description: ADMIN o MEDICO. De la más nueva a la más vieja. Filtro opcional por estado.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [en_espera, en_atencion, finalizada, cancelada]
 *     responses:
 *       200:
 *         description: Lista de urgencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Urgencia'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *   post:
 *     tags: [Urgencias]
 *     summary: Ingresar una urgencia
 *     description: >
 *       Solo ADMIN (no hay recepcionista). Se pide el DNI. Si el paciente existe se usa; si no, se lo
 *       registra en el momento (nombre, apellido, DNI, obra social) y se le crea la cuenta con usuario y
 *       contraseña iniciales iguales a su DNI (la contraseña se guarda encriptada).
 *       La hora de llegada la pone el servidor. Queda en estado en_espera.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IngresoUrgencia'
 *     responses:
 *       201:
 *         description: Urgencia ingresada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConUrgencia'
 *       400:
 *         description: Datos inválidos (DNI, motivo, prioridad, tipo) o falta nombre/apellido de un paciente nuevo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: El tipo de urgencia o la obra social no existen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
urgenciaRouter.get("/", adminOMedico, findAll);
urgenciaRouter.post("/", soloAdmin, add);

/**
 * @openapi
 * /urgencias/{idAtencion}:
 *   get:
 *     tags: [Urgencias]
 *     summary: Ver una urgencia
 *     description: ADMIN o MEDICO.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: La urgencia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Urgencia'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   put:
 *     tags: [Urgencias]
 *     summary: Editar una urgencia en espera
 *     description: >
 *       Solo ADMIN, y solo mientras está en espera. Permite corregir motivo, tipo y prioridad
 *       (la prioridad la decide una persona y puede cambiar). La lista de espera se reordena sola.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditarUrgencia'
 *     responses:
 *       200:
 *         description: Urgencia actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Urgencia'
 *       400:
 *         description: Datos inválidos o la urgencia ya no está en espera
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
urgenciaRouter.get("/:idAtencion", adminOMedico, findOne);
urgenciaRouter.put("/:idAtencion", soloAdmin, update);

/**
 * @openapi
 * /urgencias/{idAtencion}/atender:
 *   patch:
 *     tags: [Urgencias]
 *     summary: Tomar al paciente (pasa a en_atencion)
 *     description: >
 *       Solo MEDICO (cualquier médico, sin importar su especialidad). Solo se puede tomar al PRIMERO
 *       de la lista de espera.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paciente en atención
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConUrgencia'
 *       400:
 *         description: No es el primero de la lista de espera, o ya no está en espera
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: El rol no corresponde (solo MEDICO atiende)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
urgenciaRouter.patch("/:idAtencion/atender", soloMedico, atender);

/**
 * @openapi
 * /urgencias/{idAtencion}/finalizar:
 *   patch:
 *     tags: [Urgencias]
 *     summary: Finalizar la atención con un diagnóstico
 *     description: >
 *       Solo el MEDICO que está atendiendo esa urgencia. Se elige un diagnóstico ya cargado
 *       (idDiagnostico) o se carga uno nuevo en el momento (nuevoDiagnostico); el nuevo queda
 *       guardado para otras atenciones y su nombre no puede repetirse.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinalizarUrgencia'
 *     responses:
 *       200:
 *         description: Atención finalizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConUrgencia'
 *       400:
 *         description: Falta el diagnóstico, no está en atención, o el nombre del diagnóstico nuevo ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         description: El rol no corresponde o la urgencia la atiende otro médico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
urgenciaRouter.patch("/:idAtencion/finalizar", soloMedico, finalizar);

/**
 * @openapi
 * /urgencias/{idAtencion}/cancelar:
 *   patch:
 *     tags: [Urgencias]
 *     summary: Cancelar una urgencia
 *     description: >
 *       ADMIN: una urgencia en espera o en atención. MEDICO: solo las que él mismo está atendiendo.
 *       No se borra: queda en el historial con estado cancelada.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idAtencion
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Urgencia cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MensajeConUrgencia'
 *       400:
 *         description: La urgencia ya estaba finalizada o cancelada
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
urgenciaRouter.patch("/:idAtencion/cancelar", adminOMedico, cancelar);
