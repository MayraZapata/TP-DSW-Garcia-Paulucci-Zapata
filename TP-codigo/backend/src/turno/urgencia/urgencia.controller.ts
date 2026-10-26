import { Request, Response } from "express";
import { LockMode, QueryOrder } from "@mikro-orm/core";
import { orm } from "../../shared/orm.js";
import { hashPassword } from "../../shared/password.js";

import { Urgencia, PRIORIDADES, Prioridad } from "./Urgencia.entity.js";
import { TipoUrgencia } from "../tipoUrgencia/tipoUrgencia.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { ObraSocial } from "../../usuarios/cualidadesUsr/obraSocial/obraSocial.entity.js";
import { existeUsuario } from "../../usuarios/existeUsuario.js";
import { normalizarDni, validarDni, buscarPacientePorDni, esErrorDniDuplicado } from "../../usuarios/paciente/dni.js";

const em = orm.em;

// ---------------------------------------------------------------------------
// Qué se trae de la base para mostrar una urgencia en pantalla
// ---------------------------------------------------------------------------
const POPULATE_VISTA = ["paciente", "paciente.obraSocial", "medico", "medico.especialidad", "tipoUrgencia", "diagnostico"] as const;

// ORDEN DE LA LISTA DE ESPERA (única fuente de verdad: la usan la lista y la validación de "atender"):
//   1) prioridad: rojo, amarillo, verde. La columna es un ENUM('rojo','amarillo','verde') y MySQL ordena
//      los ENUM por su posición (no alfabéticamente), por eso rojo queda primero.
//   2) dentro de la misma prioridad: hora de llegada (la pone el servidor). Se compara fecha + hora y,
//      si llegaron en el mismo segundo, desempata el número de atención (idAtencion), que solo crece.
// Así, si hay 2 rojos y un verde y entra otro rojo, queda 3.º y el verde pasa a 4.º.
const ORDEN_COLA = {
    prioridad: QueryOrder.ASC,
    fechaAtencion: QueryOrder.ASC,
    horaAtencion: QueryOrder.ASC,
    idAtencion: QueryOrder.ASC,
} as const;


// ---------------------------------------------------------------------------
// Errores "esperables" (datos mal cargados, reglas del negocio). Se lanzan con throw y se convierten
// en respuesta HTTP en un solo lugar. Lanzarlos adentro de una transacción hace que se deshaga todo.
// ---------------------------------------------------------------------------
class ErrorNegocio extends Error {
    constructor(public status: number, message: string, public extra: object = {}) {
        super(message);
    }
}

function responderError(res: Response, error: any) {
    if (error instanceof ErrorNegocio) {
        return res.status(error.status).json({ message: error.message, ...error.extra });
    }
    // Red de seguridad de los índices únicos de la base (dos pedidos exactamente simultáneos)
    if (esErrorDniDuplicado(error)) {
        return res.status(400).json({ message: "Ya existe un paciente con ese DNI" });
    }
    if (error?.code === "ER_DUP_ENTRY" && String(error.message).includes("uq_diagnostico_nombre")) {
        return res.status(400).json({ message: "Ya existe un diagnóstico con ese nombre. Elegilo de la lista." });
    }
    return res.status(500).json({ message: error.message });
}


// ---------------------------------------------------------------------------
// Validaciones de los datos que carga una persona
// ---------------------------------------------------------------------------
function validarMotivo(valor: unknown): string {
    const motivo = String(valor ?? "").trim();
    if (!motivo) throw new ErrorNegocio(400, "El motivo de la urgencia es obligatorio");
    if (motivo.length > 300) throw new ErrorNegocio(400, "El motivo no puede superar los 300 caracteres");
    return motivo;
}

function validarPrioridad(valor: unknown): Prioridad {
    const prioridad = String(valor ?? "").trim().toLowerCase();
    if (!PRIORIDADES.includes(prioridad as Prioridad)) {
        throw new ErrorNegocio(400, "La prioridad es obligatoria y debe ser rojo, amarillo o verde");
    }
    return prioridad as Prioridad;
}

// TIPO "OTRO": permite agregar una descripción breve y OPCIONAL (detalleTipo).
// Es un tipo más de la tabla TipoUrgencia y se reconoce por su nombre (igual que hace la pantalla).
// La descripción solo se guarda si el tipo ES "Otro": con cualquier otro tipo se ignora y queda en null,
// así nunca queda una descripción asociada a un tipo que no corresponde.
const NOMBRE_TIPO_OTRO = "otro";
const esTipoOtro = (tipo: TipoUrgencia) => tipo.nombre.trim().toLowerCase() === NOMBRE_TIPO_OTRO;

function validarDetalleTipo(valor: unknown): string | null {
    const detalle = String(valor ?? "").trim();
    if (!detalle) return null;   // es opcional: vacío = sin descripción
    if (detalle.length > 150) throw new ErrorNegocio(400, "La descripción de la urgencia no puede superar los 150 caracteres");
    return detalle;
}

// Hora de llegada: la pone el SERVIDOR (nunca viene del navegador). Se arma igual que en los turnos
// (fecha a medianoche local + hora "HH:MM:SS") para que se guarde y se lea con el mismo criterio.
function llegadaAhora() {
    const ahora = new Date();
    const dos = (n: number) => String(n).padStart(2, "0");
    const fecha = `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`;
    const hora = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}`;
    return { fechaAtencion: new Date(`${fecha}T00:00:00`), horaAtencion: hora };
}

// Se vuelve a leer la urgencia con todo lo que la pantalla necesita mostrar
function buscarVista(idAtencion: number) {
    return em.findOneOrFail(Urgencia, { idAtencion }, { populate: POPULATE_VISTA });
}


// ---------------------------------------------------------------------------
// LISTAS
// ---------------------------------------------------------------------------

// Lista de la guardia: primero la LISTA DE ESPERA ya ordenada (el primero de la lista es el próximo a atender)
// y después los pacientes que están EN ATENCIÓN. Es lo que la pantalla consulta cada pocos segundos.
export async function guardia(req: Request, res: Response) {
    try {
        const enEspera = await em.find(
            Urgencia,
            { estado: "en_espera" },
            { orderBy: ORDEN_COLA, populate: POPULATE_VISTA }
        );
        const enAtencion = await em.find(
            Urgencia,
            { estado: "en_atencion" },
            { orderBy: { fechaAtencion: QueryOrder.ASC, horaAtencion: QueryOrder.ASC, idAtencion: QueryOrder.ASC }, populate: POPULATE_VISTA }
        );
        res.json([...enEspera, ...enAtencion]);
    } catch (error: any) {
        responderError(res, error);
    }
}

// Todas las urgencias (de cualquier estado), de la más nueva a la más vieja. Filtro opcional: ?estado=finalizada
export async function findAll(req: Request, res: Response) {
    try {
        const filtro: any = {};
        if (req.query.estado) filtro.estado = String(req.query.estado);
        const urgencias = await em.find(Urgencia, filtro, {
            orderBy: { fechaAtencion: QueryOrder.DESC, horaAtencion: QueryOrder.DESC, idAtencion: QueryOrder.DESC },
            populate: POPULATE_VISTA,
        });
        res.json(urgencias);
    } catch (error: any) {
        responderError(res, error);
    }
}

export async function findOne(req: Request, res: Response) {
    try {
        const urgencia = await em.findOne(Urgencia, { idAtencion: Number(req.params.idAtencion) }, { populate: POPULATE_VISTA });
        if (!urgencia) return res.status(404).json({ message: "Urgencia inexistente" });
        res.json(urgencia);
    } catch (error: any) {
        responderError(res, error);
    }
}


// ---------------------------------------------------------------------------
// INGRESO (lo registra el ADMIN: no hay recepcionista)
//   Body: { dni, motivo, idTipo, prioridad, nombre?, apellido?, idObra?, detalleTipo? }
//   (detalleTipo: descripción opcional, solo se guarda si el tipo es "Otro")
//   - Si el DNI ya es de un paciente, se usa ese paciente (nombre/apellido/idObra se ignoran).
//   - Si no existe, se REGISTRA ahí mismo (nombre, apellido, DNI, obra social) y se le crea la cuenta:
//     usuario = DNI y contraseña inicial = DNI (guardada encriptada, como todas).
//   Todo ocurre en UNA transacción: si algo falla, no queda ni el paciente ni la urgencia.
// ---------------------------------------------------------------------------
export async function add(req: Request, res: Response) {
    try {
        const dni = normalizarDni(req.body.dni);
        const errorDni = validarDni(dni);
        if (errorDni) throw new ErrorNegocio(400, errorDni);

        const motivo = validarMotivo(req.body.motivo);
        const prioridad = validarPrioridad(req.body.prioridad);
        if (!req.body.idTipo) throw new ErrorNegocio(400, "El tipo de urgencia es obligatorio");

        const { idAtencion, pacienteNuevo } = await em.transactional(async (tx) => {

            const tipoUrgencia = await tx.findOne(TipoUrgencia, { idTipo: Number(req.body.idTipo) });
            if (!tipoUrgencia) throw new ErrorNegocio(404, "Tipo de urgencia inexistente");

            let paciente = await buscarPacientePorDni(tx, dni);
            let pacienteNuevo = false;

            if (!paciente) {
                const nombre = String(req.body.nombre ?? "").trim();
                const apellido = String(req.body.apellido ?? "").trim();
                if (!nombre || !apellido) {
                    throw new ErrorNegocio(400, "Ese DNI no está registrado: completá nombre y apellido para registrar al paciente");
                }

                let obraSocial = null;
                if (req.body.idObra) {
                    obraSocial = await tx.findOne(ObraSocial, { idObra: Number(req.body.idObra) });
                    if (!obraSocial) throw new ErrorNegocio(404, "Obra Social inexistente");
                }

                // El nombre de usuario es el DNI: tiene que estar libre entre pacientes, médicos y administradores
                if (await existeUsuario(dni)) {
                    throw new ErrorNegocio(400, "Ya existe un usuario con nombre de usuario igual a ese DNI. Cargá al paciente desde Gestión de Pacientes con otro usuario");
                }

                paciente = tx.create(Paciente, {
                    nombre,
                    apellido,
                    dni,
                    nombreUsuario: dni,
                    password: await hashPassword(dni),   // contraseña inicial = DNI, encriptada
                    obraSocial,
                });
                pacienteNuevo = true;
            }

            // (Se arma con new + asignación, igual que las consultas en Atencion.controller)
            const urgencia = new Urgencia();
            urgencia.tipoAtencion = "urgencia";
            Object.assign(urgencia, llegadaAhora());                    // fecha y hora de llegada: del servidor
            urgencia.estado = "en_espera";
            urgencia.paciente = paciente;
            urgencia.tipoUrgencia = tipoUrgencia;
            urgencia.prioridad = prioridad;
            urgencia.motivo = motivo;
            urgencia.detalleTipo = esTipoOtro(tipoUrgencia) ? validarDetalleTipo(req.body.detalleTipo) : null;
            tx.persist(urgencia);

            await tx.flush();
            return { idAtencion: urgencia.idAtencion, pacienteNuevo };
        });

        res.status(201).json({
            message: pacienteNuevo
                ? "Paciente registrado y urgencia ingresada. Su usuario y contraseña iniciales son su DNI."
                : "Urgencia ingresada",
            pacienteNuevo,
            urgencia: await buscarVista(idAtencion),
        });
    } catch (error: any) {
        responderError(res, error);
    }
}


// ---------------------------------------------------------------------------
// EDITAR (ADMIN) - mientras está EN ESPERA se pueden corregir motivo, tipo y prioridad.
// La prioridad la decide una persona y puede cambiar (el paciente empeora o mejora): la lista se reordena sola.
// ---------------------------------------------------------------------------
export async function update(req: Request, res: Response) {
    try {
        const idAtencion = Number(req.params.idAtencion);

        await em.transactional(async (tx) => {
            const urgencia = await tx.findOne(Urgencia, { idAtencion }, { lockMode: LockMode.PESSIMISTIC_WRITE, populate: ["tipoUrgencia"] });
            if (!urgencia) throw new ErrorNegocio(404, "Urgencia inexistente");
            if (urgencia.estado !== "en_espera") {
                throw new ErrorNegocio(400, "Solo se pueden editar las urgencias que están en espera");
            }

            if (req.body.motivo !== undefined) urgencia.motivo = validarMotivo(req.body.motivo);
            if (req.body.prioridad !== undefined) urgencia.prioridad = validarPrioridad(req.body.prioridad);
            if (req.body.idTipo !== undefined) {
                const tipo = await tx.findOne(TipoUrgencia, { idTipo: Number(req.body.idTipo) });
                if (!tipo) throw new ErrorNegocio(404, "Tipo de urgencia inexistente");
                urgencia.tipoUrgencia = tipo;
            }

            // Coherencia del detalle: solo existe si el tipo (el nuevo o el que ya tenía) es "Otro".
            // Si se cambió a otro tipo, la descripción se borra; si sigue siendo "Otro", se actualiza solo si vino en el pedido.
            if (!esTipoOtro(urgencia.tipoUrgencia)) {
                urgencia.detalleTipo = null;
            } else if (req.body.detalleTipo !== undefined) {
                urgencia.detalleTipo = validarDetalleTipo(req.body.detalleTipo);
            }
        });

        res.json(await buscarVista(idAtencion));
    } catch (error: any) {
        responderError(res, error);
    }
}


// ---------------------------------------------------------------------------
// ATENDER (MEDICO): el médico toma al paciente.
//   Reglas:
//   - Cualquier médico puede atender la guardia, sea cual sea su especialidad.
//   - Solo se puede tomar al PRIMERO de la lista de espera.
//   Se bloquea la lista de espera mientras se decide, así dos médicos que aprietan "Atender" a la vez
//   no pueden quedarse con el mismo paciente.
// ---------------------------------------------------------------------------
export async function atender(req: Request, res: Response) {
    try {
        const idAtencion = Number(req.params.idAtencion);

        await em.transactional(async (tx) => {
            const medico = await tx.findOne(Medico, { matricula: req.auth!.id });
            if (!medico) throw new ErrorNegocio(401, "Sesión inválida");

            const cola = await tx.find(
                Urgencia,
                { estado: "en_espera" },
                { orderBy: ORDEN_COLA, lockMode: LockMode.PESSIMISTIC_WRITE, populate: ["paciente"] }
            );

            const elegida = cola.find((u) => u.idAtencion === idAtencion);
            if (!elegida) {
                const existe = await tx.count(Urgencia, { idAtencion });
                if (!existe) throw new ErrorNegocio(404, "Urgencia inexistente");
                throw new ErrorNegocio(400, "Esa urgencia ya no está en espera");
            }

            const primero = cola[0];
            if (primero.idAtencion !== idAtencion) {
                throw new ErrorNegocio(
                    400,
                    `Solo se puede atender al primero de la lista de espera: ${primero.paciente.nombre} ${primero.paciente.apellido} (${primero.prioridad})`
                );
            }

            elegida.estado = "en_atencion";
            elegida.medico = medico;
        });

        res.json({ message: "Paciente en atención", urgencia: await buscarVista(idAtencion) });
    } catch (error: any) {
        responderError(res, error);
    }
}


// ---------------------------------------------------------------------------
// FINALIZAR (MEDICO): cierra la atención con un diagnóstico.
//   Body: { idDiagnostico }                                  -> elige uno ya cargado
//     o   { nuevoDiagnostico: { nombreDiagnostico, tratamiento? } }  -> lo carga en el momento
//   El diagnóstico nuevo queda guardado en el catálogo para otras atenciones, y su nombre no puede repetirse.
// ---------------------------------------------------------------------------
export async function finalizar(req: Request, res: Response) {
    try {
        const idAtencion = Number(req.params.idAtencion);
        const { idDiagnostico, nuevoDiagnostico } = req.body;

        if (idDiagnostico && nuevoDiagnostico) {
            throw new ErrorNegocio(400, "Elegí un diagnóstico existente o cargá uno nuevo, no los dos a la vez");
        }
        if (!idDiagnostico && !nuevoDiagnostico) {
            throw new ErrorNegocio(400, "Para finalizar hay que elegir un diagnóstico o cargar uno nuevo");
        }

        await em.transactional(async (tx) => {
            const urgencia = await tx.findOne(Urgencia, { idAtencion }, { populate: ["medico"], lockMode: LockMode.PESSIMISTIC_WRITE });
            if (!urgencia) throw new ErrorNegocio(404, "Urgencia inexistente");
            if (urgencia.estado !== "en_atencion") {
                throw new ErrorNegocio(400, "Solo se puede finalizar una urgencia que está en atención");
            }
            if (urgencia.medico?.matricula !== req.auth!.id) {
                throw new ErrorNegocio(403, "Esta urgencia la está atendiendo otro médico");
            }

            let diagnostico: Diagnostico | null;

            if (idDiagnostico) {
                diagnostico = await tx.findOne(Diagnostico, { idDiagnostico: Number(idDiagnostico) });
                if (!diagnostico) throw new ErrorNegocio(404, "Diagnóstico no encontrado");
            } else {
                const nombreDiagnostico = String(nuevoDiagnostico.nombreDiagnostico ?? "").trim();
                if (!nombreDiagnostico) throw new ErrorNegocio(400, "El nombre del diagnóstico nuevo es obligatorio");
                if (nombreDiagnostico.length > 100) throw new ErrorNegocio(400, "El nombre del diagnóstico no puede superar los 100 caracteres");

                // Sin duplicar nombres (igual que el CRUD de Diagnósticos). La base compara sin
                // distinguir mayúsculas ni tildes, así que "Gripe" y "gripe" son el mismo diagnóstico.
                const existente = await tx.findOne(Diagnostico, { nombreDiagnostico });
                if (existente) {
                    throw new ErrorNegocio(
                        400,
                        `Ya existe un diagnóstico llamado "${existente.nombreDiagnostico}". Elegilo de la lista.`,
                        { idDiagnosticoExistente: existente.idDiagnostico }
                    );
                }

                // La columna tratamiento de la base es NOT NULL: si no se escribe nada se guarda vacío
                diagnostico = new Diagnostico();
                diagnostico.nombreDiagnostico = nombreDiagnostico;
                diagnostico.tratamiento = String(nuevoDiagnostico.tratamiento ?? "").trim();
                tx.persist(diagnostico);
            }

            urgencia.diagnostico = diagnostico;
            urgencia.estado = "finalizada";
        });

        res.json({ message: "Atención finalizada", urgencia: await buscarVista(idAtencion) });
    } catch (error: any) {
        responderError(res, error);
    }
}


// ---------------------------------------------------------------------------
// CANCELAR
//   - ADMIN: cancela una urgencia en espera o en atención (por ejemplo, el paciente se fue).
//   - MEDICO: solo las que él mismo está atendiendo.
// ---------------------------------------------------------------------------
export async function cancelar(req: Request, res: Response) {
    try {
        const idAtencion = Number(req.params.idAtencion);

        await em.transactional(async (tx) => {
            const urgencia = await tx.findOne(Urgencia, { idAtencion }, { populate: ["medico"], lockMode: LockMode.PESSIMISTIC_WRITE });
            if (!urgencia) throw new ErrorNegocio(404, "Urgencia inexistente");

            if (urgencia.estado !== "en_espera" && urgencia.estado !== "en_atencion") {
                throw new ErrorNegocio(400, "Solo se puede cancelar una urgencia que está en espera o en atención");
            }
            if (req.auth!.rol === "MEDICO" && !(urgencia.estado === "en_atencion" && urgencia.medico?.matricula === req.auth!.id)) {
                throw new ErrorNegocio(403, "Solo podés cancelar las urgencias que estás atendiendo");
            }

            urgencia.estado = "cancelada";
        });

        res.json({ message: "Urgencia cancelada", urgencia: await buscarVista(idAtencion) });
    } catch (error: any) {
        responderError(res, error);
    }
}
