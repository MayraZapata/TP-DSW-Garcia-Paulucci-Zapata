import { Router } from "express";
import { findAll, findOne, add, update, remove } from "./obraSocial.controller.js";
import { autenticar, autorizar } from "../../../shared/auth.middleware.js";

export const obraSocialRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];

/**
 * @openapi
 * components:
 *   schemas:
 *     ObraSocial:
 *       type: object
 *       properties:
 *         idObra:
 *           type: integer
 *           example: 1
 *         nombreObra:
 *           type: string
 *           example: OSDE
 *         monto:
 *           type: number
 *           example: 5000
 *     ObraSocialInput:
 *       type: object
 *       required: [nombreObra, monto]
 *       properties:
 *         nombreObra:
 *           type: string
 *           example: OSDE
 *         monto:
 *           type: number
 *           example: 5000
 */

/**
 * @openapi
 * /obrasSociales:
 *   get:
 *     tags: [Obras Sociales]
 *     summary: Listar las obras sociales
 *     description: Público (se usa en el registro).
 *     responses:
 *       200:
 *         description: Lista de obras sociales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ObraSocial'
 *   post:
 *     tags: [Obras Sociales]
 *     summary: Crear una obra social
 *     description: Solo ADMIN. No permite nombres repetidos.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ObraSocialInput'
 *     responses:
 *       201:
 *         description: Obra social creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ObraSocial'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
obraSocialRouter.get("/", findAll);
obraSocialRouter.post("/", soloAdmin, add);

/**
 * @openapi
 * /obrasSociales/{id}:
 *   get:
 *     tags: [Obras Sociales]
 *     summary: Obtener una obra social
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
 *         description: La obra social
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ObraSocial'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   put:
 *     tags: [Obras Sociales]
 *     summary: Editar una obra social
 *     description: Solo ADMIN. No permite chocar con el nombre de otra obra social.
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
 *             $ref: '#/components/schemas/ObraSocialInput'
 *     responses:
 *       200:
 *         description: Obra social actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ObraSocial'
 *       400:
 *         $ref: '#/components/responses/SolicitudInvalida'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 *   delete:
 *     tags: [Obras Sociales]
 *     summary: Eliminar una obra social
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
 *         description: Obra social eliminada
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontradoMensaje'
 */
obraSocialRouter.get("/:id", findOne);
obraSocialRouter.put("/:id", soloAdmin, update);
obraSocialRouter.delete("/:id", soloAdmin, remove);