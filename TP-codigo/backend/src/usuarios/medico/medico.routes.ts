import { Router } from "express";
import { findAll, findOne, add, update, remove, findByEspecialidad } from "./medico.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const medicoRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];
const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];
const adminOPaciente = [autenticar, autorizar("ADMIN", "PACIENTE")];

/**
 * @openapi
 * components:
 *   schemas:
 *     Medico:
 *       type: object
 *       properties:
 *         matricula:
 *           type: integer
 *           example: 12345
 *         nombre:
 *           type: string
 *           example: Carlos
 *         apellido:
 *           type: string
 *           example: López
 *         nombreUsuario:
 *           type: string
 *           example: clopez
 *         especialidad:
 *           $ref: '#/components/schemas/Especialidad'
 *     MedicoInput:
 *       type: object
 *       required: [matricula, nombre, apellido, nombreUsuario, password, idEspecialidad]
 *       properties:
 *         matricula:
 *           type: integer
 *           description: Es la clave del médico. No puede repetirse.
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         nombreUsuario:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *           description: Obligatoria al crear. Al editar es opcional (si viene, se vuelve a hashear).
 *         idEspecialidad:
 *           type: integer
 */

/**
 * @openapi
 * /medicos:
 *   get:
 *     tags: [Médicos]
 *     summary: Listar todos los médicos
 *     description: ADMIN o MEDICO.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de médicos (con su especialidad)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *   post:
 *     tags: [Médicos]
 *     summary: Crear un médico
 *     description: Solo ADMIN. La matrícula y el nombre de usuario no pueden repetirse.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicoInput'
 *     responses:
 *       201:
 *         description: Médico creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
medicoRouter.get("/", adminOMedico, findAll);
medicoRouter.post("/", soloAdmin, add);

/**
 * @openapi
 * /medicos/especialidad/{idEspecialidad}:
 *   get:
 *     tags: [Médicos]
 *     summary: Listar los médicos de una especialidad
 *     description: ADMIN o PACIENTE (se usa al sacar un turno).
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: idEspecialidad
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Médicos de esa especialidad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         description: La especialidad no existe o no tiene médicos asignados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
medicoRouter.get("/especialidad/:idEspecialidad", adminOPaciente, findByEspecialidad);

/**
 * @openapi
 * /medicos/{id}:
 *   get:
 *     tags: [Médicos]
 *     summary: Obtener un médico por matrícula
 *     description: ADMIN o MEDICO. El parámetro id es la matrícula.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Matrícula del médico
 *         schema:
 *           type: integer
 *         example: 12345
 *     responses:
 *       200:
 *         description: El médico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *   put:
 *     tags: [Médicos]
 *     summary: Editar un médico
 *     description: Solo ADMIN. El parámetro id es la matrícula.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Matrícula del médico
 *         schema:
 *           type: integer
 *         example: 12345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicoInput'
 *     responses:
 *       200:
 *         description: Médico actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *   delete:
 *     tags: [Médicos]
 *     summary: Eliminar un médico
 *     description: Solo ADMIN. El parámetro id es la matrícula.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Matrícula del médico
 *         schema:
 *           type: integer
 *         example: 12345
 *     responses:
 *       204:
 *         description: Médico eliminado
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 */
medicoRouter.get("/:id", adminOMedico, findOne);
medicoRouter.put("/:id", soloAdmin, update);
medicoRouter.delete("/:id", soloAdmin, remove);