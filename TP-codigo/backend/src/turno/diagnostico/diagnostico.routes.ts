import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./diagnostico.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const diagnosticoRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];
const adminOMedico = [autenticar, autorizar("ADMIN", "MEDICO")];

/**
 * @openapi
 * components:
 *   schemas:
 *     Diagnostico:
 *       type: object
 *       properties:
 *         idDiagnostico:
 *           type: integer
 *           example: 1
 *         nombreDiagnostico:
 *           type: string
 *           example: Gripe
 *         tratamiento:
 *           type: string
 *           nullable: true
 *           example: Reposo e hidratación
 *     DiagnosticoInput:
 *       type: object
 *       required: [nombreDiagnostico]
 *       properties:
 *         nombreDiagnostico:
 *           type: string
 *           example: Gripe
 *         tratamiento:
 *           type: string
 *           nullable: true
 */

/**
 * @openapi
 * /diagnosticos:
 *   get:
 *     tags: [Diagnósticos]
 *     summary: Listar los diagnósticos
 *     description: ADMIN o MEDICO.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de diagnósticos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Diagnostico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *   post:
 *     tags: [Diagnósticos]
 *     summary: Crear un diagnóstico
 *     description: Solo ADMIN. No permite nombres repetidos.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiagnosticoInput'
 *     responses:
 *       201:
 *         description: Diagnóstico creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Diagnostico'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
diagnosticoRouter.get("/", adminOMedico, findAll);
diagnosticoRouter.post("/", soloAdmin, add);

/**
 * @openapi
 * /diagnosticos/{id}:
 *   get:
 *     tags: [Diagnósticos]
 *     summary: Obtener un diagnóstico
 *     description: ADMIN o MEDICO.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: El diagnóstico
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Diagnostico'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   put:
 *     tags: [Diagnósticos]
 *     summary: Editar un diagnóstico
 *     description: Solo ADMIN. No permite chocar con el nombre de otro diagnóstico.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DiagnosticoInput'
 *     responses:
 *       200:
 *         description: Diagnóstico actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Diagnostico'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   delete:
 *     tags: [Diagnósticos]
 *     summary: Eliminar un diagnóstico
 *     description: Solo ADMIN.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       204:
 *         description: Diagnóstico eliminado
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
diagnosticoRouter.get("/:id", adminOMedico, findOne);
diagnosticoRouter.put("/:id", soloAdmin, update);
diagnosticoRouter.delete("/:id", soloAdmin, remove);