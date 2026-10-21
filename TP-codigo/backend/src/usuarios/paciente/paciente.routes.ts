import { Router } from "express";
import { findAll, findOne, findByDni, add, update, remove } from "./paciente.controller.js";
import { autenticar, autorizar, soloPropio } from "../../shared/auth.middleware.js";

export const pacienteRouter = Router();

const soloAdmin = [autenticar, autorizar("ADMIN")];
const adminOPropio = [autenticar, autorizar("ADMIN", "PACIENTE"), soloPropio("PACIENTE", "id")];

/**
 * @openapi
 * components:
 *   schemas:
 *     Paciente:
 *       type: object
 *       properties:
 *         idPaciente:
 *           type: integer
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Ana
 *         apellido:
 *           type: string
 *           example: Gómez
 *         dni:
 *           type: string
 *           example: "30123456"
 *         nombreUsuario:
 *           type: string
 *           example: agomez
 *         obraSocial:
 *           type: object
 *           nullable: true
 *           properties:
 *             idObra:
 *               type: integer
 *             nombreObra:
 *               type: string
 *             monto:
 *               type: number
 *     PacienteInput:
 *       type: object
 *       required: [nombre, apellido, dni, nombreUsuario, password]
 *       properties:
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         dni:
 *           type: string
 *         nombreUsuario:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *           description: Obligatoria al crear. Se ignora al editar (se cambia en /login/cambiar-password).
 *         idObra:
 *           type: integer
 *           nullable: true
 *           description: Id de la obra social (opcional)
 */

/**
 * @openapi
 * /pacientes:
 *   get:
 *     tags: [Pacientes]
 *     summary: Listar todos los pacientes
 *     description: Solo ADMIN.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Paciente'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *   post:
 *     tags: [Pacientes]
 *     summary: Registrar un paciente
 *     description: Público (es el registro de cuenta). La contraseña se guarda hasheada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PacienteInput'
 *     responses:
 *       201:
 *         description: Paciente creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paciente'
 *       400:
 *         description: El nombre de usuario ya existe o falta la contraseña
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: La obra social indicada no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
pacienteRouter.get("/", soloAdmin, findAll);
pacienteRouter.post("/", add);

/**
 * @openapi
 * /pacientes/{id}:
 *   get:
 *     tags: [Pacientes]
 *     summary: Obtener un paciente
 *     description: ADMIN, o el propio paciente.
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
 *         description: El paciente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paciente'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *   put:
 *     tags: [Pacientes]
 *     summary: Editar un paciente
 *     description: ADMIN, o el propio paciente. La contraseña no se modifica por acá.
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
 *             $ref: '#/components/schemas/PacienteInput'
 *     responses:
 *       200:
 *         description: Paciente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paciente'
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 *   delete:
 *     tags: [Pacientes]
 *     summary: Eliminar un paciente
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
 *         description: Paciente eliminado
 *       401:
 *         $ref: '#/components/responses/NoAutenticado'
 *       403:
 *         $ref: '#/components/responses/Prohibido'
 *       404:
 *         $ref: '#/components/responses/NoEncontrado'
 */
/**
 * @openapi
 * /pacientes/dni/{dni}:
 *   get:
 *     tags: [Pacientes]
 *     summary: Buscar un paciente por DNI
 *     description: >
 *       Solo ADMIN. Ignora puntos y espacios ("47.076.568" es igual a "47076568").
 *       Siempre responde 200: si no existe devuelve existe = false (en la guardia significa
 *       "hay que registrarlo ahora"). La pantalla de guardia lo usa para rellenar los datos solos.
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
 *         description: Resultado de la búsqueda
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 existe:
 *                   type: boolean
 *                   example: true
 *                 paciente:
 *                   $ref: '#/components/schemas/Paciente'
 *                 dni:
 *                   type: string
 *                   description: DNI normalizado (solo cuando existe = false)
 *                   example: "47076568"
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
 */
// Va ANTES de "/:id" para que "dni" no se confunda con un id
pacienteRouter.get("/dni/:dni", soloAdmin, findByDni);

pacienteRouter.get("/:id", adminOPropio, findOne);
pacienteRouter.put("/:id", adminOPropio, update);
pacienteRouter.delete("/:id", soloAdmin, remove);