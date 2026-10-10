import { Router } from "express";

import { findAll, findOne, add, update, remove } from "./especialidad.controller.js";
import { autenticar, autorizar } from "../../../shared/auth.middleware.js";

const soloAdmin = [autenticar, autorizar("ADMIN")];


export const especialidadRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Especialidad:
 *       type: object
 *       properties:
 *         idEspecialidad:
 *           type: integer
 *           example: 1
 *         nombreEspecialidad:
 *           type: string
 *           example: Cardiología
 *         descripcion:
 *           type: string
 *           nullable: true
 *           example: Enfermedades del corazón
 *     EspecialidadInput:
 *       type: object
 *       required: [nombreEspecialidad]
 *       properties:
 *         nombreEspecialidad:
 *           type: string
 *           example: Cardiología
 *         descripcion:
 *           type: string
 *           nullable: true
 */

/**
 * @openapi
 * /especialidades:
 *   get:
 *     tags: [Especialidades]
 *     summary: Listar las especialidades
 *     description: Público (se usa en el registro y al sacar turnos).
 *     responses:
 *       200:
 *         description: Lista de especialidades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Especialidad'
 *   post:
 *     tags: [Especialidades]
 *     summary: Crear una especialidad
 *     description: Solo ADMIN. No permite nombres repetidos.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EspecialidadInput'
 *     responses:
 *       201:
 *         description: Especialidad creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Especialidad'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
especialidadRouter.get("/", findAll);

especialidadRouter.post("/", soloAdmin, add);

/**
 * @openapi
 * /especialidades/{id}:
 *   get:
 *     tags: [Especialidades]
 *     summary: Obtener una especialidad
 *     description: Público.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: La especialidad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Especialidad'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   put:
 *     tags: [Especialidades]
 *     summary: Editar una especialidad
 *     description: Solo ADMIN. No permite chocar con el nombre de otra especialidad.
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
 *             $ref: '#/components/schemas/EspecialidadInput'
 *     responses:
 *       200:
 *         description: Especialidad actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Especialidad'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   delete:
 *     tags: [Especialidades]
 *     summary: Eliminar una especialidad
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
 *         description: Especialidad eliminada
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
especialidadRouter.get("/:id",findOne);

especialidadRouter.put("/:id", soloAdmin, update);

especialidadRouter.delete("/:id", soloAdmin, remove);