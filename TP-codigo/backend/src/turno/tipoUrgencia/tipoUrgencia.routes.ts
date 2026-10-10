import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./tipoUrgencia.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const tipoUrgenciaRouter = Router();

// Todas las rutas de este router exigen sesión y rol ADMIN
tipoUrgenciaRouter.use(autenticar, autorizar("ADMIN"));

/**
 * @openapi
 * components:
 *   schemas:
 *     TipoUrgencia:
 *       type: object
 *       properties:
 *         idTipo:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Crítica
 *         descripcionTipo:
 *           type: string
 *           nullable: true
 *           example: Requiere atención inmediata
 *     TipoUrgenciaInput:
 *       type: object
 *       required: [nombre]
 *       properties:
 *         nombre:
 *           type: string
 *           example: Crítica
 *         descripcionTipo:
 *           type: string
 *           nullable: true
 */

/**
 * @openapi
 * /tiposUrgencia:
 *   get:
 *     tags: [Tipos de Urgencia]
 *     summary: Listar los tipos de urgencia
 *     description: Solo ADMIN.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de tipos de urgencia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TipoUrgencia'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *   post:
 *     tags: [Tipos de Urgencia]
 *     summary: Crear un tipo de urgencia
 *     description: Solo ADMIN. No permite nombres repetidos.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TipoUrgenciaInput'
 *     responses:
 *       201:
 *         description: Tipo de urgencia creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoUrgencia'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
tipoUrgenciaRouter.get("/", findAll);
tipoUrgenciaRouter.post("/", add);

/**
 * @openapi
 * /tiposUrgencia/{id}:
 *   get:
 *     tags: [Tipos de Urgencia]
 *     summary: Obtener un tipo de urgencia
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
 *       200:
 *         description: El tipo de urgencia
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoUrgencia'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   put:
 *     tags: [Tipos de Urgencia]
 *     summary: Editar un tipo de urgencia
 *     description: Solo ADMIN. No permite chocar con el nombre de otro tipo.
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
 *             $ref: '#/components/schemas/TipoUrgenciaInput'
 *     responses:
 *       200:
 *         description: Tipo de urgencia actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TipoUrgencia'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   delete:
 *     tags: [Tipos de Urgencia]
 *     summary: Eliminar un tipo de urgencia
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
 *         description: Tipo de urgencia eliminado
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
tipoUrgenciaRouter.get("/:id", findOne);
tipoUrgenciaRouter.put("/:id", update);
tipoUrgenciaRouter.delete("/:id", remove);