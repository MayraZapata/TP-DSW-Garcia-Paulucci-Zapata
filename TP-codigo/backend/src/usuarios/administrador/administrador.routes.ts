import { Router } from "express";
import { findOnlyOne } from "./administrador.controller.js";
import { autenticar, autorizar } from "../../shared/auth.middleware.js";

export const administradorRouter = Router();

/**
 * @openapi
 * /administradores:
 *   get:
 *     tags: [Administradores]
 *     summary: Listar los administradores
 *     description: Solo ADMIN. La contraseña nunca se devuelve.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de administradores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idAdministrador:
 *                     type: integer
 *                     example: 1
 *                   nombreUsuario:
 *                     type: string
 *                     example: admin
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 */
administradorRouter.get("/", autenticar, autorizar("ADMIN"), findOnlyOne);