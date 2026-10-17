import { Request, Response } from "express";
import { UniqueConstraintViolationException, wrap } from "@mikro-orm/core";
import { orm } from "../../shared/orm.js";

import { Urgencia } from "./Urgencia.entity.js";
import { Paciente } from "../../usuarios/paciente/paciente.entity.js";
import { Medico } from "../../usuarios/medico/medico.entity.js";
import { TipoUrgencia } from "../tipoUrgencia/tipoUrgencia.entity.js";
import { Diagnostico } from "../diagnostico/diagnostico.entity.js";
import {
    ESTADO,
    ESTADOS_ACTIVOS,
    ErrorNegocio,
    esPrioridad,
    compararParaLaCola,
    fechaYHoraDeLlegada,
    minutosDesdeLlegada,
    ordenarListaEspera,
} from "./urgencia.reglas.js";

const em = orm.em;

// Todo lo que necesita mostrar la pantalla de guardia de cada urgencia
const POPULATE = ["paciente", "paciente.obraSocial", "medico", "medico.especialidad", "diagnostico", "tipoUrgencia"] as const;

// Convierte una urgencia en el JSON que recibe el frontend, sumando datos calculados (posición, minutos...)
function serializar(urgencia: Urgencia, extra: Record<string, unknown> = {}) {
    return { ...wrap(urgencia).toJSON(), ...extra };
}

// Convierte los errores en respuestas JSON: los "esperables" (ErrorNegocio) con su código, el resto como 500
function responderError(res: Response, error: unknown) {
    if (error instanceof ErrorNegocio)
        return res.status(error.status).json({ message: error.message });

    if (error instanceof UniqueConstraintViolationException)
        return res.status(409).json({ message: "Otro usuario acaba de cargar el mismo dato. Volvé a intentarlo." });

    console.error(error);
    return res.status(500).json({ message: error instanceof Error ? error.message : "Error interno" });
}

const nombreDe = (u: Urgencia) => `${u.paciente.nombre} ${u.paciente.apellido}`.trim();

// Lee :id de la URL; si no es un número válido, es un "no existe"
function idDeLaUrl(req: Request): number {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) throw new ErrorNegocio(404, "Urgencia inexistente");
    return id;
}

async function buscarUrgencia(id: number): Promise<Urgencia> {
    const urgencia = await em.findOne(Urgencia, { idAtencion: id }, { populate: POPULATE });
    if (!urgencia) throw new ErrorNegocio(404, "Urgencia inexistente");
    return urgencia;
}

// La lista de espera completa, ya ordenada (prioridad y, dentro de ella, hora de llegada)
async function listaDeEspera(): Promise<Urgencia[]> {
    const enEspera = await em.find(Urgencia, { estado: ESTADO.EN_ESPERA }, { populate: POPULATE });
    return ordenarListaEspera(enEspera);
}

// Valida y devuelve el tipo de urgencia indicado
async function buscarTipo(idTipo: unknown): Promise<TipoUrgencia> {
    const id = Number(idTipo);
    const tipo = Number.isInteger(id) ? await em.findOne(TipoUrgencia, { idTipo: id }) : null;
    if (!tipo) throw new ErrorNegocio(404, "El tipo de urgencia indicado no existe");
    return tipo;
}

async function tipoDesdeTexto(texto: unknown): Promise<TipoUrgencia> {
    const nombre = typeof texto === "string" ? texto.trim() : "";
    if (!nombre) throw new ErrorNegocio(400, "Si elegís «Otros», escribí cuál es el tipo de urgencia");
    if (nombre.length > 50) throw new ErrorNegocio(400, "El tipo de urgencia no puede superar los 50 caracteres");

    const existente = await em.findOne(TipoUrgencia, { nombre });
    if (existente) return existente;

    const nuevo = new TipoUrgencia();
    nuevo.nombre = nombre;
    nuevo.descripcionTipo = "Cargado desde el ingreso de guardia (Otros)";
    em.persist(nuevo);
    return nuevo;
}

function validarMotivo(valor: unknown): string {
    const motivo = typeof valor === "string" ? valor.trim() : "";
    if (!motivo) throw new ErrorNegocio(400, "El motivo es obligatorio");
    if (motivo.length > 255) throw new ErrorNegocio(400, "El motivo no puede superar los 255 caracteres");
    return motivo;
}






//GETALL (solo las ACTIVAS: es lo que se ve y se refresca en la pantalla de guardia)
// Devuelve primero a quienes están EN ATENCIÓN y después la LISTA DE ESPERA ya ordenada,
// con la `posicion` de cada uno. El orden lo calcula el servidor: así todas las
// pantallas abiertas muestran lo mismo.
export async function activas(req: Request, res: Response) {
    try {
        const lista = await em.find(Urgencia, { estado: { $in: ESTADOS_ACTIVOS } }, { populate: POPULATE });
        const ahora = new Date();

        const extra = (u: Urgencia, posicion: number | null) => ({
            posicion,
            minutosDesdeLlegada: minutosDesdeLlegada(u.fechaAtencion, u.horaAtencion, ahora),
        });

        const enAtencion = lista.filter((u) => u.estado === ESTADO.EN_ATENCION).sort(compararParaLaCola);
        const enEspera = ordenarListaEspera(lista.filter((u) => u.estado === ESTADO.EN_ESPERA));

        res.json([
            ...enAtencion.map((u) => serializar(u, extra(u, null))),
            ...enEspera.map((u, i) => serializar(u, extra(u, i + 1))),
        ]);
    } catch (error) {
        responderError(res, error);
    }
}





//GETALL con filtros: todas las urgencias (también las cerradas), de la más nueva a la más vieja.
// Opcional: ?estado=finalizada,cancelada  y  ?limite=50
export async function findAll(req: Request, res: Response) {
    try {
        const estados = String(req.query.estado ?? "").split(",").map((e) => e.trim()).filter(Boolean);
        const validos: string[] = Object.values(ESTADO);
        if (estados.some((e) => !validos.includes(e)))
            throw new ErrorNegocio(400, `Estado inválido. Valores posibles: ${validos.join(", ")}`);

        const limite = Math.min(Math.max(Number(req.query.limite) || 100, 1), 500);

        const urgencias = await em.find(
            Urgencia,
            estados.length ? { estado: { $in: estados } } : {},
            {
                populate: POPULATE,
                orderBy: { fechaAtencion: "desc", horaAtencion: "desc", idAtencion: "desc" },
                limit: limite,
            }
        );

        res.json(urgencias.map((u) => serializar(u)));
    } catch (error) {
        responderError(res, error);
    }
}





//GETONE
export async function findOne(req: Request, res: Response) {
    try {
        const urgencia = await buscarUrgencia(idDeLaUrl(req));
        res.json(serializar(urgencia));
    } catch (error) {
        responderError(res, error);
    }
}





//ADD (ingreso a la guardia: lo registra el ADMIN)
// El paciente TIENE que existir ya (la pantalla lo busca por DNI o lo registra antes):
// una urgencia no puede existir sin un paciente registrado.
// La fecha y hora de llegada las pone el servidor; lo que mande el cliente se ignora.
export async function add(req: Request, res: Response) {
    try {
        const { idPaciente, motivo, idTipo, tipoOtro, prioridad } = req.body;

        const idPac = Number(idPaciente);
        if (!Number.isInteger(idPac) || idPac <= 0)
            throw new ErrorNegocio(400, "Falta el paciente: buscalo por DNI (o registralo) antes de ingresar la urgencia");

        const motivoLimpio = validarMotivo(motivo);

        if (!idTipo && tipoOtro === undefined) throw new ErrorNegocio(400, "El tipo de urgencia es obligatorio");

        // La prioridad la decide una persona (no se deduce del tipo): rojo, amarillo o verde
        if (!esPrioridad(prioridad))
            throw new ErrorNegocio(400, "La prioridad es obligatoria: rojo (inmediata), amarillo (intermedia) o verde (puede esperar)");

        const paciente = await em.findOne(Paciente, { idPaciente: idPac });
        if (!paciente)
            throw new ErrorNegocio(404, "El paciente indicado no existe: tiene que estar registrado antes del ingreso");

        const tipo = await buscarTipo(idTipo);

        // Evita cargar dos veces al mismo paciente (doble clic, o ya está esperando / en atención)
        const yaActiva = await em.findOne(Urgencia, { paciente, estado: { $in: ESTADOS_ACTIVOS } });
        if (yaActiva)
            throw new ErrorNegocio(409, "Ese paciente ya tiene una urgencia activa (en espera o en atención)");

        const { fecha, hora } = fechaYHoraDeLlegada();

        const urgencia = new Urgencia();
        urgencia.fechaAtencion = fecha;
        urgencia.horaAtencion = hora;
        // mismo criterio que los turnos (Atencion.controller): número de ingreso de 6 cifras
        urgencia.nroIngreso = Math.floor(100000 + Math.random() * 900000);
        urgencia.estado = ESTADO.EN_ESPERA;
        urgencia.paciente = paciente;
        urgencia.tipoUrgencia = tipo ?? (await tipoDesdeTexto(tipoOtro));
        urgencia.prioridad = prioridad;
        urgencia.motivo = motivoLimpio;

        await em.persistAndFlush(urgencia);

        // En qué lugar de la lista de espera quedó (puede pasar delante de otros si su prioridad es mayor)
        const lista = await listaDeEspera();
        const posicion = lista.findIndex((u) => u.idAtencion === urgencia.idAtencion) + 1;

        res.status(201).json({
            message: `Urgencia registrada. Posición en la lista de espera: ${posicion}`,
            posicion,
            urgencia: serializar(urgencia),
        });
    } catch (error) {
        responderError(res, error);
    }
}





//UPDATE (corregir motivo / tipo / prioridad: solo mientras sigue EN ESPERA)
export async function update(req: Request, res: Response) {
    try {
        const urgencia = await buscarUrgencia(idDeLaUrl(req));

        if (urgencia.estado !== ESTADO.EN_ESPERA)
            throw new ErrorNegocio(409, "Solo se puede editar una urgencia que está en espera");

        const { motivo, idTipo, prioridad } = req.body;

        if (motivo !== undefined) urgencia.motivo = validarMotivo(motivo);

        if (idTipo !== undefined) urgencia.tipoUrgencia = await buscarTipo(idTipo);

        if (prioridad !== undefined) {
            if (!esPrioridad(prioridad))
                throw new ErrorNegocio(400, "La prioridad debe ser rojo, amarillo o verde");
            urgencia.prioridad = prioridad;
        }

        await em.flush();

        const lista = await listaDeEspera();
        const posicion = lista.findIndex((u) => u.idAtencion === urgencia.idAtencion) + 1;

        res.json({ message: "Urgencia actualizada", posicion, urgencia: serializar(urgencia) });
    } catch (error) {
        responderError(res, error);
    }
}





//DELETE (solo una urgencia cargada por error: en espera, o ya cancelada).
// Las que se atendieron (en atención / finalizadas) forman parte del historial clínico y no se borran.
export async function remove(req: Request, res: Response) {
    try {
        const urgencia = await buscarUrgencia(idDeLaUrl(req));

        if (urgencia.estado !== ESTADO.EN_ESPERA && urgencia.estado !== ESTADO.CANCELADA)
            throw new ErrorNegocio(409, "No se puede eliminar una urgencia que ya se atendió: forma parte del historial clínico");

        await em.removeAndFlush(urgencia);

        res.sendStatus(204);
    } catch (error) {
        responderError(res, error);
    }
}





//TOMAR (el MÉDICO toma a un paciente de la lista de espera)
// Reglas: 1) la especialidad del médico tiene que estar habilitada para guardia,
//         2) solo puede tomar al PRIMERO de la fila,
//         3) no puede estar ya atendiendo a otro paciente.
export async function tomar(req: Request, res: Response) {
    try {
        const id = idDeLaUrl(req);
        const matricula = req.auth!.id;

        const medico = await em.findOne(Medico, { matricula }, { populate: ["especialidad"] });
        if (!medico) throw new ErrorNegocio(404, "Médico inexistente");

        // La habilitación es un dato de la especialidad (columna atiendeUrgencias): sumar otra no requiere tocar código
        if (!medico.especialidad.atiendeUrgencias) {
            throw new ErrorNegocio(
                403,
                `La especialidad ${medico.especialidad.nombreEspecialidad} no está habilitada para atender urgencias`
            );
        }

        const urgencia = await buscarUrgencia(id);
        if (urgencia.estado !== ESTADO.EN_ESPERA)
            throw new ErrorNegocio(409, "Esta urgencia ya no está en espera (otro médico la tomó, o se canceló)");

        const ocupado = await em.findOne(Urgencia, { medico, estado: ESTADO.EN_ATENCION });
        if (ocupado)
            throw new ErrorNegocio(409, "Ya estás atendiendo a otro paciente: finalizá o cancelá esa atención primero");

        // Solo se puede atender al PRIMERO de la fila
        const lista = await listaDeEspera();
        const primero = lista[0];
        if (primero && primero.idAtencion !== urgencia.idAtencion) {
            throw new ErrorNegocio(
                409,
                `Primero hay que atender a ${nombreDe(primero)} (prioridad ${primero.prioridad}, llegó a las ${primero.horaAtencion.slice(0, 5)}): es el siguiente de la fila`
            );
        }

        // "Reclamo atómico": el UPDATE solo afecta la fila si TODAVÍA está en espera.
        // Si dos médicos aprietan "Atender" al mismo tiempo, MySQL le da la fila a uno solo
        // y al otro le devuelve 0 filas afectadas.
        const filas = await em.nativeUpdate(
            Urgencia,
            { idAtencion: id, estado: ESTADO.EN_ESPERA },
            { estado: ESTADO.EN_ATENCION, medico }
        );
        if (filas === 0)
            throw new ErrorNegocio(409, "Otro médico tomó a este paciente un instante antes");

        em.clear(); // el UPDATE fue directo a la base: se vuelve a leer la urgencia ya actualizada
        const actualizada = await buscarUrgencia(id);

        res.json({ message: `Tomaste a ${nombreDe(actualizada)}`, urgencia: serializar(actualizada) });
    } catch (error) {
        responderError(res, error);
    }
}





//FINALIZAR (el MÉDICO que atiende cierra la atención y deja el diagnóstico)
// Body: { idDiagnostico }  -> elige uno ya cargado
//       { nuevoDiagnostico: { nombreDiagnostico, tratamiento? } } -> lo carga en el momento
// Un diagnóstico nuevo queda guardado en el catálogo para otras atenciones. Si el nombre
// ya existía, NO se duplica: se usa el que ya estaba.
export async function finalizar(req: Request, res: Response) {
    try {
        const urgencia = await buscarUrgencia(idDeLaUrl(req));

        if (urgencia.estado !== ESTADO.EN_ATENCION)
            throw new ErrorNegocio(409, "Solo se puede finalizar una urgencia que está en atención");

        if (urgencia.medico?.matricula !== req.auth!.id)
            throw new ErrorNegocio(403, "Esta urgencia la está atendiendo otro médico");

        const { idDiagnostico, nuevoDiagnostico } = req.body;

        if (idDiagnostico && nuevoDiagnostico)
            throw new ErrorNegocio(400, "Elegí un diagnóstico ya cargado o cargá uno nuevo, no los dos");

        let diagnostico: Diagnostico;
        let reutilizado = false;

        if (idDiagnostico) {
            const existente = await em.findOne(Diagnostico, { idDiagnostico: Number(idDiagnostico) });
            if (!existente) throw new ErrorNegocio(404, "Diagnóstico no encontrado");
            diagnostico = existente;

        } else if (nuevoDiagnostico) {
            const nombre = typeof nuevoDiagnostico.nombreDiagnostico === "string" ? nuevoDiagnostico.nombreDiagnostico.trim() : "";
            const tratamiento = typeof nuevoDiagnostico.tratamiento === "string" ? nuevoDiagnostico.tratamiento.trim() : "";

            if (!nombre) throw new ErrorNegocio(400, "El nombre del diagnóstico nuevo es obligatorio");
            if (nombre.length > 100) throw new ErrorNegocio(400, "El nombre del diagnóstico no puede superar los 100 caracteres");
            if (tratamiento.length > 300) throw new ErrorNegocio(400, "El tratamiento no puede superar los 300 caracteres");

            // Sin duplicar nombres (la base compara sin distinguir mayúsculas ni acentos)
            const mismoNombre = await em.findOne(Diagnostico, { nombreDiagnostico: nombre });
            if (mismoNombre) {
                diagnostico = mismoNombre;
                reutilizado = true;
            } else {
                diagnostico = new Diagnostico();
                diagnostico.nombreDiagnostico = nombre;
                diagnostico.tratamiento = tratamiento;
                em.persist(diagnostico);
            }

        } else {
            throw new ErrorNegocio(400, "Elegí un diagnóstico ya cargado o cargá uno nuevo");
        }

        urgencia.diagnostico = diagnostico;
        urgencia.estado = ESTADO.FINALIZADA;

        // Un solo flush = una sola transacción: se crea el diagnóstico (si es nuevo) y se finaliza, o nada
        await em.flush();

        res.json({
            message: reutilizado
                ? "Atención finalizada. Ya existía un diagnóstico con ese nombre: se usó el que estaba cargado."
                : "Atención finalizada y diagnóstico guardado.",
            diagnosticoReutilizado: reutilizado,
            urgencia: serializar(urgencia),
        });
    } catch (error) {
        responderError(res, error);
    }
}





//CANCELAR
// ADMIN: puede cancelar una urgencia en espera o en atención (el paciente se fue, ingreso erróneo...).
// MÉDICO: solo la que él mismo está atendiendo.
export async function cancelar(req: Request, res: Response) {
    try {
        const urgencia = await buscarUrgencia(idDeLaUrl(req));

        if (urgencia.estado !== ESTADO.EN_ESPERA && urgencia.estado !== ESTADO.EN_ATENCION)
            throw new ErrorNegocio(409, "Esta urgencia ya está finalizada o cancelada");

        if (req.auth!.rol === "MEDICO") {
            const esSuya = urgencia.estado === ESTADO.EN_ATENCION && urgencia.medico?.matricula === req.auth!.id;
            if (!esSuya)
                throw new ErrorNegocio(403, "Un médico solo puede cancelar la urgencia que está atendiendo");
        }

        urgencia.estado = ESTADO.CANCELADA;
        await em.flush();

        res.json({ message: "Urgencia cancelada", urgencia: serializar(urgencia) });
    } catch (error) {
        responderError(res, error);
    }
}
