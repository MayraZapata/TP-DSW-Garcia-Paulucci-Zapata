import { Router } from "express";
import { login, me, logout, cambiarPassword } from "./login.controller.js";
import { autenticar } from "../shared/auth.middleware.js";

export const loginRouter = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Credenciales:
 *       type: object
 *       required: [usuario, password]
 *       properties:
 *         usuario:
 *           type: string
 *           example: jperez
 *         password:
 *           type: string
 *           format: password
 *           example: miClave123
 *     SesionActiva:
 *       type: object
 *       properties:
 *         rol:
 *           type: string
 *           enum: [ADMIN, MEDICO, PACIENTE]
 *           example: PACIENTE
 *         usuario:
 *           type: object
 *           description: Datos básicos de la persona (vacío si el rol es ADMIN)
 *           example: { idPaciente: 1, nombre: Ana, apellido: Gómez, dni: "30123456" }
 *     CambioPassword:
 *       type: object
 *       required: [passwordActual, passwordNueva]
 *       properties:
 *         passwordActual:
 *           type: string
 *           format: password
 *         passwordNueva:
 *           type: string
 *           format: password
 *           minLength: 6
 */

/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Login]
 *     summary: Iniciar sesión
 *     description: >
 *       Valida usuario y contraseña (se busca en pacientes, médicos y administradores).
 *       Si son correctos, el servidor guarda el token JWT en una cookie httpOnly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Credenciales'
 *     responses:
 *       200:
 *         description: Sesión iniciada (la cookie `token` queda guardada en el navegador)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SesionActiva'
 *       400:
 *         description: Faltan credenciales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Usuario o contraseña incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
loginRouter.post("/", login);

/**
 * @openapi
 * /login/me:
 *   get:
 *     tags: [Login]
 *     summary: Consultar la sesión actual
 *     description: Devuelve el rol y los datos de quien tiene la sesión abierta (según la cookie).
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesión válida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SesionActiva'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 */
loginRouter.get("/me", autenticar, me);

/**
 * @openapi
 * /login/logout:
 *   post:
 *     tags: [Login]
 *     summary: Cerrar sesión
 *     description: Borra la cookie del token.
 *     responses:
 *       204:
 *         description: Sesión cerrada
 */
loginRouter.post("/logout", logout);

/**
 * @openapi
 * /login/cambiar-password:
 *   post:
 *     tags: [Login]
 *     summary: Cambiar la contraseña propia
 *     description: Exige la contraseña actual. La nueva debe tener al menos 6 caracteres.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CambioPassword'
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Contraseña actualizada
 *       400:
 *         description: Faltan datos, la nueva es muy corta o la actual es incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 */
loginRouter.post("/cambiar-password", autenticar, cambiarPassword);