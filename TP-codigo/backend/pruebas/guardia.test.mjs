// Pruebas de la API del módulo de Guardia / Urgencias contra el backend y la base REALES.
//
// Cómo correrlas (con el backend andando y la base cargada con database/gestion_turnos.sql, que ya trae las contraseñas encriptadas):
//     node --env-file=.env.development --test pruebas/guardia.test.mjs
//
// - Se pueden correr varias veces: usan DNI nuevos cada vez y al empezar cancelan lo que hubiera en la guardia.
// - Usan los usuarios de prueba de gestion_turnos.sql: admin, drCuddy y drRoss (Medicina General), drHouse (Infectología). Todos los médicos atienden la guardia.
// - Para mirar la base usan DB_URL (solo hacen SELECT).

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";

const BASE = process.env.BASE_URL ?? "http://localhost:3000/api";
const db = await mysql.createConnection(process.env.DB_URL);
after(() => db.end());

// ---------------------------------------------------------------- ayudas
// Un "cliente" guarda la cookie de sesión y devuelve { status, data } sin lanzar errores por los 4xx.
function cliente() {
    let cookie = "";
    async function pedir(metodo, ruta, cuerpo) {
        const res = await fetch(BASE + ruta, {
            method: metodo,
            headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
            body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        });
        const data = await res.json().catch(() => null);
        return { status: res.status, data };
    }
    return {
        get: (r) => pedir("GET", r),
        post: (r, b) => pedir("POST", r, b ?? {}),
        put: (r, b) => pedir("PUT", r, b ?? {}),
        patch: (r, b) => pedir("PATCH", r, b ?? {}),
        async login(usuario, password) {
            const res = await fetch(BASE + "/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usuario, password }),
            });
            const set = res.headers.getSetCookie().find((c) => c.startsWith("token="));
            cookie = set ? set.split(";")[0] : "";
            return { status: res.status, data: await res.json().catch(() => null) };
        },
    };
}

const anon = cliente();
const admin = cliente();
const cuddy = cliente();   // Medicina General
const ross = cliente();    // Medicina General
const house = cliente();   // Infectología (también atiende la guardia)

// DNI únicos por corrida: 8 cifras a partir de la hora
const base = Number(String(Date.now()).slice(-7)) + 20000000;
let siguiente = 0;
const dniNuevo = () => String(base + siguiente++ * 7);
const conPuntos = (dni) => dni.replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2.$3");

let tipos = {};   // nombre -> idTipo
const ingreso = (dni, extra = {}) => admin.post("/urgencias", {
    dni, motivo: "motivo de prueba", idTipo: tipos["Corte"], prioridad: "verde",
    nombre: "Paciente", apellido: "De Prueba", ...extra,
});
// Estado actual de la lista de espera como lista de "motivos" (los usamos como etiquetas)
async function esperaComo() {
    const { data } = await admin.get("/urgencias/guardia");
    return data.filter((u) => u.estado === "en_espera").map((u) => u.motivo);
}
async function filas(sql, params = []) {
    const [r] = await db.query(sql, params);
    return r;
}

// ---------------------------------------------------------------- preparación
before(async () => {
    assert.equal((await admin.login("admin", "admin123")).status, 200, "No se pudo iniciar sesión como admin (¿cargaste database/gestion_turnos.sql?)");
    assert.equal((await cuddy.login("drCuddy", "seis666")).status, 200);
    assert.equal((await ross.login("drRoss", "siete777")).status, 200);
    assert.equal((await house.login("drHouse", "uno111")).status, 200);

    const t = (await admin.get("/tiposUrgencia")).data;
    for (const n of ["Corte", "Convulsiones", "Fractura", "Otro"]) {
        tipos[n] = t.find((x) => x.nombre === n)?.idTipo;
        assert.ok(tipos[n], `Falta el tipo de urgencia "${n}" en la base`);
    }

    // Dejar la guardia vacía (cancela lo que haya quedado de corridas anteriores)
    const activas = (await admin.get("/urgencias/guardia")).data;
    for (const u of activas) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
});


// ================================================================ 1) DNI y pacientes
describe("DNI: búsqueda, alta automática y unicidad", () => {
    const dniA = dniNuevo();
    let idPacienteA;

    it("busca un paciente existente ignorando puntos", async () => {
        const r = await admin.get("/pacientes/dni/47.076.568");
        assert.equal(r.status, 200);
        assert.equal(r.data.existe, true);
        assert.equal(r.data.paciente.apellido, "Perez");
    });

    it("busca un paciente que tiene espacios en el DNI de los datos viejos (7915420)", async () => {
        const r = await admin.get("/pacientes/dni/7.915.420");
        assert.equal(r.data.existe, true);
        assert.equal(r.data.paciente.apellido, "Musso");
    });

    it("un DNI inexistente responde existe=false (no es un error)", async () => {
        const r = await admin.get(`/pacientes/dni/${dniA}`);
        assert.equal(r.status, 200);
        assert.equal(r.data.existe, false);
    });

    it("DNI inválido en la búsqueda: 400", async () => {
        assert.equal((await admin.get("/pacientes/dni/abc")).status, 400);
    });

    it("la búsqueda por DNI es solo para ADMIN", async () => {
        assert.equal((await cuddy.get("/pacientes/dni/47076568")).status, 403);
        assert.equal((await anon.get("/pacientes/dni/47076568")).status, 401);
    });

    it("un DNI inexistente SIN nombre/apellido no crea nada: 400", async () => {
        const r = await admin.post("/urgencias", { dni: dniNuevo(), motivo: "x", idTipo: tipos["Corte"], prioridad: "rojo" });
        assert.equal(r.status, 400);
    });

    it("un DNI inexistente registra al paciente y su cuenta (usuario y contraseña = DNI, encriptada)", async () => {
        const r = await ingreso(conPuntos(dniA), { nombre: "Ana", apellido: "Nueva", prioridad: "verde", motivo: "alta-automatica" });
        assert.equal(r.status, 201, JSON.stringify(r.data));
        assert.equal(r.data.pacienteNuevo, true);
        idPacienteA = r.data.urgencia.paciente.idPaciente;

        const [p] = await filas("SELECT dni, nombreUsuario, password FROM paciente WHERE idPaciente = ?", [idPacienteA]);
        assert.equal(p.dni, dniA, "el DNI se guarda sin puntos");
        assert.equal(p.nombreUsuario, dniA, "usuario = DNI");
        assert.ok(p.password.startsWith("$2"), "la contraseña está encriptada (bcrypt)");
        assert.notEqual(p.password, dniA);
    });

    it("ese paciente puede iniciar sesión con usuario y contraseña = DNI", async () => {
        const c = cliente();
        const r = await c.login(dniA, dniA);
        assert.equal(r.status, 200);
        assert.equal(r.data.rol, "PACIENTE");
        assert.equal(r.data.usuario.nombre, "Ana");
    });

    it("una segunda urgencia con el mismo DNI (con o sin puntos) reutiliza al paciente: no lo duplica", async () => {
        const r1 = await ingreso(dniA, { motivo: "segunda-sin-puntos" });
        const r2 = await ingreso(conPuntos(dniA), { motivo: "segunda-con-puntos" });
        assert.equal(r1.status, 201);
        assert.equal(r2.status, 201);
        assert.equal(r1.data.pacienteNuevo, false);
        assert.equal(r2.data.pacienteNuevo, false);
        assert.equal(r1.data.urgencia.paciente.idPaciente, idPacienteA);
        const [{ n }] = await filas("SELECT COUNT(*) n FROM paciente WHERE dni = ?", [dniA]);
        assert.equal(Number(n), 1);
    });

    const datosRegistro = (dni, usuario) => ({ nombre: "Otro", apellido: "Paciente", dni, nombreUsuario: usuario, password: "clave123", idObra: null });

    it("REGISTRO PÚBLICO: repetir ese DNI (con y sin puntos, con espacios) falla", async () => {
        for (const variante of [dniA, conPuntos(dniA), ` ${conPuntos(dniA)} `, dniA.slice(0, 2) + " " + dniA.slice(2)]) {
            const r = await anon.post("/pacientes", datosRegistro(variante, "usr" + Math.random().toString(36).slice(2, 8)));
            assert.equal(r.status, 400, `"${variante}" debería fallar`);
            assert.match(r.data.message, /DNI/);
        }
    });

    it("REGISTRO PÚBLICO: un DNI nuevo con puntos se guarda normalizado", async () => {
        const dni = dniNuevo();
        const r = await anon.post("/pacientes", datosRegistro(conPuntos(dni), "pub" + dni));
        assert.equal(r.status, 201, JSON.stringify(r.data));
        assert.equal(r.data.dni, dni);
        // ...y ya no se puede volver a registrar
        assert.equal((await anon.post("/pacientes", datosRegistro(dni, "pub2" + dni))).status, 400);
    });

    it("REGISTRO PÚBLICO: DNI vacío o con letras: 400", async () => {
        assert.equal((await anon.post("/pacientes", datosRegistro("", "x" + dniNuevo()))).status, 400);
        assert.equal((await anon.post("/pacientes", datosRegistro("12abc", "y" + dniNuevo()))).status, 400);
    });

    it("EDICIÓN: no se puede poner a un paciente el DNI de otro (con o sin puntos)", async () => {
        const otro = (await anon.post("/pacientes", datosRegistro(dniNuevo(), "edit" + dniNuevo()))).data;
        for (const variante of [dniA, conPuntos(dniA)]) {
            const r = await admin.put(`/pacientes/${otro.idPaciente}`, { nombre: "Otro", apellido: "Paciente", dni: variante, nombreUsuario: otro.nombreUsuario });
            assert.equal(r.status, 400, `"${variante}" debería fallar`);
        }
        const [{ dni }] = await filas("SELECT dni FROM paciente WHERE idPaciente = ?", [otro.idPaciente]);
        assert.notEqual(dni, dniA, "el DNI del paciente no cambió");
    });

    it("EDICIÓN: guardar un paciente con su propio DNI (con puntos) sí se puede y queda normalizado", async () => {
        const p = (await admin.get(`/pacientes/${idPacienteA}`)).data;
        const r = await admin.put(`/pacientes/${idPacienteA}`, { nombre: p.nombre, apellido: p.apellido, dni: conPuntos(dniA), nombreUsuario: p.nombreUsuario, idObra: null });
        assert.equal(r.status, 200, JSON.stringify(r.data));
        assert.equal(r.data.dni, dniA);
    });

    it("el índice único de la base también lo impide (red de seguridad)", async () => {
        await assert.rejects(
            () => db.query("INSERT INTO paciente (nombre, apellido, dni, nombreUsuario, password) VALUES ('x','y',?, ?, 'z')", [dniA, "dup" + dniA]),
            /Duplicate entry|ER_DUP_ENTRY|denied/   // si el usuario no tiene insert, igual se rechaza
        );
    });

    it("si el DNI ya es el nombre de usuario de otra cuenta, no se crea el paciente a medias", async () => {
        const dni = dniNuevo();
        await anon.post("/pacientes", datosRegistro(dniNuevo(), dni));   // alguien eligió ese número como usuario
        const r = await ingreso(dni, { nombre: "Ana", apellido: "Choque" });
        assert.equal(r.status, 400);
        const [{ n }] = await filas("SELECT COUNT(*) n FROM paciente WHERE dni = ?", [dni]);
        assert.equal(Number(n), 0, "no quedó un paciente huérfano");
    });
});


// ================================================================ 2) validaciones del ingreso y roles
describe("Ingreso: validaciones y roles", () => {
    it("solo el ADMIN registra ingresos (médico, paciente y anónimo: no)", async () => {
        const datos = { dni: "47076568", motivo: "x", idTipo: tipos["Corte"], prioridad: "rojo" };
        assert.equal((await cuddy.post("/urgencias", datos)).status, 403);
        const pac = cliente(); await pac.login("user1", "uno111");
        assert.equal((await pac.post("/urgencias", datos)).status, 403);
        assert.equal((await anon.post("/urgencias", datos)).status, 401);
    });

    it("la prioridad es obligatoria y solo rojo/amarillo/verde", async () => {
        const base = { dni: "47076568", motivo: "x", idTipo: tipos["Corte"] };
        assert.equal((await admin.post("/urgencias", base)).status, 400);
        assert.equal((await admin.post("/urgencias", { ...base, prioridad: "azul" })).status, 400);
        assert.equal((await admin.post("/urgencias", { ...base, prioridad: "ROJO" })).status, 201, "se acepta en mayúsculas");
    });

    it("motivo y tipo son obligatorios; el tipo tiene que existir", async () => {
        assert.equal((await admin.post("/urgencias", { dni: "47076568", idTipo: tipos["Corte"], prioridad: "rojo" })).status, 400);
        assert.equal((await admin.post("/urgencias", { dni: "47076568", motivo: "x", prioridad: "rojo" })).status, 400);
        assert.equal((await admin.post("/urgencias", { dni: "47076568", motivo: "x", idTipo: 99999, prioridad: "rojo" })).status, 404);
    });

    it("la hora de llegada la pone el servidor (se ignora la que mande el navegador)", async () => {
        const r = await ingreso("47076568", { motivo: "hora-servidor", horaAtencion: "03:00:00", fechaAtencion: "2001-01-01" });
        assert.equal(r.status, 201);
        assert.notEqual(r.data.urgencia.horaAtencion, "03:00:00");
        assert.ok(r.data.urgencia.fechaAtencion.startsWith(new Date().getFullYear().toString()));
        const [row] = await filas("SELECT tipoAtencion, estado, fechaAtencion, horaAtencion FROM atencion WHERE idAtencion = ?", [r.data.urgencia.idAtencion]);
        assert.equal(row.tipoAtencion, "urgencia");
        assert.equal(row.estado, "en_espera");
    });

    it("limpiar: dejar la guardia vacía", async () => {
        for (const u of (await admin.get("/urgencias/guardia")).data) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
        assert.deepEqual(await esperaComo(), []);
    });
});


// ================================================================ 3) lista de espera ordenada
describe("Lista de espera: prioridad y luego hora de llegada", () => {
    it("un VERDE con tipo grave (Convulsiones) va detrás de un ROJO con tipo leve (Corte)", async () => {
        await ingreso("47076568", { motivo: "VERDE-grave", prioridad: "verde", idTipo: tipos["Convulsiones"] });
        await ingreso("7248513", { motivo: "ROJO-leve", prioridad: "rojo", idTipo: tipos["Corte"] });
        assert.deepEqual(await esperaComo(), ["ROJO-leve", "VERDE-grave"]);
    });

    it("2 rojos y un verde: entra otro rojo, queda 3.º y el verde pasa a 4.º", async () => {
        // vaciar y armar: R1, R2, V (3.º)
        for (const u of (await admin.get("/urgencias/guardia")).data) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
        await ingreso("47076568", { motivo: "R1", prioridad: "rojo" });
        await ingreso("7248513", { motivo: "R2", prioridad: "rojo" });
        await ingreso("39135893", { motivo: "V", prioridad: "verde" });
        assert.deepEqual(await esperaComo(), ["R1", "R2", "V"]);

        await ingreso("26156284", { motivo: "R3", prioridad: "rojo" });
        assert.deepEqual(await esperaComo(), ["R1", "R2", "R3", "V"]);
    });

    it("amarillo queda entre rojo y verde, y se respeta la llegada dentro de cada color", async () => {
        await ingreso("20154984", { motivo: "A1", prioridad: "amarillo" });
        await ingreso("39641855", { motivo: "A2", prioridad: "amarillo" });
        await ingreso("7915420", { motivo: "R4", prioridad: "rojo" });
        assert.deepEqual(await esperaComo(), ["R1", "R2", "R3", "R4", "A1", "A2", "V"]);
    });

    it("el orden también se respeta si la hora de llegada es de días distintos (fecha + hora)", async () => {
        // Se adelanta a mano la llegada de "A2" para que sea más vieja que "A1" y se mira el orden.
        // (Solo se puede con un usuario con UPDATE: UsuarioBD lo tiene.)
        const [a2] = await filas("SELECT idAtencion FROM atencion WHERE motivo = 'A2' AND estado = 'en_espera' ORDER BY idAtencion DESC LIMIT 1");
        await db.query("UPDATE atencion SET fechaAtencion = DATE_SUB(fechaAtencion, INTERVAL 1 DAY) WHERE idAtencion = ?", [a2.idAtencion]);
        assert.deepEqual(await esperaComo(), ["R1", "R2", "R3", "R4", "A2", "A1", "V"]);
        await db.query("UPDATE atencion SET fechaAtencion = DATE_ADD(fechaAtencion, INTERVAL 1 DAY) WHERE idAtencion = ?", [a2.idAtencion]);
    });

    it("editar la prioridad (ADMIN) reordena la lista sola", async () => {
        const lista = (await admin.get("/urgencias/guardia")).data;
        const v = lista.find((u) => u.motivo === "V");
        const r = await admin.put(`/urgencias/${v.idAtencion}`, { prioridad: "rojo" });
        assert.equal(r.status, 200);
        assert.equal(r.data.prioridad, "rojo");
        // pasó a ser el último ROJO (llegó después de R1, R2, R3 y R4 no: R4 llegó después de V)
        assert.deepEqual(await esperaComo(), ["R1", "R2", "V", "R3", "R4", "A1", "A2"]);
    });

    it("solo el ADMIN edita; y no se puede editar lo que no está en espera", async () => {
        const v = (await admin.get("/urgencias/guardia")).data.find((u) => u.motivo === "V");
        assert.equal((await cuddy.put(`/urgencias/${v.idAtencion}`, { prioridad: "verde" })).status, 403);
        assert.equal((await admin.put(`/urgencias/${v.idAtencion}`, { prioridad: "azul" })).status, 400);
        assert.equal((await admin.put(`/urgencias/${v.idAtencion}`, { idTipo: 99999 })).status, 404);
    });

    it("la lista de la guardia es para ADMIN y MEDICO", async () => {
        assert.equal((await cuddy.get("/urgencias/guardia")).status, 200);
        assert.equal((await anon.get("/urgencias/guardia")).status, 401);
        const pac = cliente(); await pac.login("user1", "uno111");
        assert.equal((await pac.get("/urgencias/guardia")).status, 403);
    });
});

// ================================================================ 4) atender y finalizar
describe("Atención: primero de la fila (cualquier médico puede atender)", () => {
    let lista;
    before(async () => {
        for (const u of (await admin.get("/urgencias/guardia")).data) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
        await ingreso("47076568", { motivo: "P1", prioridad: "rojo" });
        await ingreso("7248513", { motivo: "P2", prioridad: "rojo" });
        await ingreso("39135893", { motivo: "P3", prioridad: "verde" });
        lista = (await admin.get("/urgencias/guardia")).data;
    });
    const id = (motivo) => lista.find((u) => u.motivo === motivo).idAtencion;

    it("solo los médicos atienden (el admin no)", async () => {
        assert.equal((await admin.patch(`/urgencias/${id("P1")}/atender`)).status, 403);
    });

    it("no se puede atender a alguien que no es el primero de la fila", async () => {
        const r = await cuddy.patch(`/urgencias/${id("P2")}/atender`);
        assert.equal(r.status, 400);
        assert.match(r.data.message, /primero/);
        const r2 = await cuddy.patch(`/urgencias/${id("P3")}/atender`);
        assert.equal(r2.status, 400);
        assert.deepEqual(await esperaComo(), ["P1", "P2", "P3"], "nadie cambió de estado");
    });

    it("el primero sí se puede atender: pasa a en_atencion con su médico", async () => {
        const r = await cuddy.patch(`/urgencias/${id("P1")}/atender`);
        assert.equal(r.status, 200, JSON.stringify(r.data));
        assert.equal(r.data.urgencia.estado, "en_atencion");
        assert.equal(r.data.urgencia.medico.apellido, "Cuddy");
        assert.deepEqual(await esperaComo(), ["P2", "P3"]);
    });

    it("el mismo paciente no se puede tomar dos veces", async () => {
        const r = await ross.patch(`/urgencias/${id("P1")}/atender`);
        assert.equal(r.status, 400);
        assert.match(r.data.message, /ya no está en espera/);
    });

    it("una urgencia que no existe: 404", async () => {
        assert.equal((await cuddy.patch("/urgencias/999999/atender")).status, 404);
    });

    it("dos médicos que aprietan 'Atender' a la vez sobre el mismo primero: solo uno se lo queda", async () => {
        const [a, b] = await Promise.all([
            cuddy.patch(`/urgencias/${id("P2")}/atender`),
            ross.patch(`/urgencias/${id("P2")}/atender`),
        ]);
        assert.deepEqual([a.status, b.status].sort(), [200, 400]);
        const [row] = await filas("SELECT estado, matricula FROM atencion WHERE idAtencion = ?", [id("P2")]);
        assert.equal(row.estado, "en_atencion");
    });

    it("un médico de CUALQUIER especialidad puede atender: Infectología toma al primero y lo finaliza", async () => {
        const atendido = await house.patch(`/urgencias/${id("P3")}/atender`);   // P3 ya es el primero
        assert.equal(atendido.status, 200, JSON.stringify(atendido.data));
        assert.equal(atendido.data.urgencia.medico.apellido, "House");
        assert.equal((await house.patch(`/urgencias/${id("P3")}/finalizar`, { idDiagnostico: 1 })).status, 200);
    });
});

describe("Finalizar con diagnóstico (existente o nuevo, sin duplicar nombres)", () => {
    let ids = {};
    const nombreNuevo = "Herida cortante " + Date.now();
    before(async () => {
        for (const u of (await admin.get("/urgencias/guardia")).data) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
        // Se ingresan y se toman uno por uno (de a uno, siempre el primero)
        for (const [m, dni] of [["F1", "47076568"], ["F2", "7248513"], ["F3", "39135893"]]) {
            const r = await ingreso(dni, { motivo: m, prioridad: "rojo" });
            ids[m] = r.data.urgencia.idAtencion;
        }
        assert.equal((await cuddy.patch(`/urgencias/${ids.F1}/atender`)).status, 200);
    });

    it("hay que elegir un diagnóstico o cargar uno nuevo (ni ninguno ni los dos)", async () => {
        assert.equal((await cuddy.patch(`/urgencias/${ids.F1}/finalizar`, {})).status, 400);
        assert.equal((await cuddy.patch(`/urgencias/${ids.F1}/finalizar`, { idDiagnostico: 1, nuevoDiagnostico: { nombreDiagnostico: "x" } })).status, 400);
        assert.equal((await cuddy.patch(`/urgencias/${ids.F1}/finalizar`, { nuevoDiagnostico: { nombreDiagnostico: "   " } })).status, 400);
        assert.equal((await cuddy.patch(`/urgencias/${ids.F1}/finalizar`, { idDiagnostico: 99999 })).status, 404);
    });

    it("solo finaliza el médico que la está atendiendo", async () => {
        const r = await ross.patch(`/urgencias/${ids.F1}/finalizar`, { idDiagnostico: 1 });
        assert.equal(r.status, 403);
        assert.equal((await admin.patch(`/urgencias/${ids.F1}/finalizar`, { idDiagnostico: 1 })).status, 403);
    });

    it("no se puede finalizar algo que sigue en espera", async () => {
        assert.equal((await cuddy.patch(`/urgencias/${ids.F2}/finalizar`, { idDiagnostico: 1 })).status, 400);
    });

    it("finaliza eligiendo un diagnóstico ya cargado", async () => {
        const r = await cuddy.patch(`/urgencias/${ids.F1}/finalizar`, { idDiagnostico: 1 });
        assert.equal(r.status, 200, JSON.stringify(r.data));
        assert.equal(r.data.urgencia.estado, "finalizada");
        assert.equal(r.data.urgencia.diagnostico.idDiagnostico, 1);
        // y no se puede finalizar dos veces
        assert.equal((await cuddy.patch(`/urgencias/${ids.F1}/finalizar`, { idDiagnostico: 1 })).status, 400);
    });

    it("finaliza cargando un diagnóstico NUEVO en el momento, que queda guardado en el catálogo", async () => {
        assert.equal((await cuddy.patch(`/urgencias/${ids.F2}/atender`)).status, 200);
        const r = await cuddy.patch(`/urgencias/${ids.F2}/finalizar`, { nuevoDiagnostico: { nombreDiagnostico: `  ${nombreNuevo}  `, tratamiento: "Sutura y curaciones" } });
        assert.equal(r.status, 200, JSON.stringify(r.data));
        assert.equal(r.data.urgencia.diagnostico.nombreDiagnostico, nombreNuevo, "se guarda sin espacios sobrantes");
        const cat = (await admin.get("/diagnosticos")).data;
        assert.equal(cat.filter((d) => d.nombreDiagnostico === nombreNuevo).length, 1, "aparece en el catálogo para otras atenciones");
    });

    it("cargar de nuevo el MISMO nombre (aunque cambien mayúsculas) no lo duplica: 400 y avisa cuál es", async () => {
        assert.equal((await cuddy.patch(`/urgencias/${ids.F3}/atender`)).status, 200);
        const r = await cuddy.patch(`/urgencias/${ids.F3}/finalizar`, { nuevoDiagnostico: { nombreDiagnostico: nombreNuevo.toUpperCase() } });
        assert.equal(r.status, 400);
        assert.ok(r.data.idDiagnosticoExistente, "devuelve el id del que ya existe");
        const [{ n }] = await filas("SELECT COUNT(*) n FROM diagnostico WHERE nombreDiagnostico = ?", [nombreNuevo]);
        assert.equal(Number(n), 1);
        // la urgencia sigue en atención (la transacción se deshizo)
        const [row] = await filas("SELECT estado FROM atencion WHERE idAtencion = ?", [ids.F3]);
        assert.equal(row.estado, "en_atencion");
        // y con el id que avisó, se puede finalizar
        assert.equal((await cuddy.patch(`/urgencias/${ids.F3}/finalizar`, { idDiagnostico: r.data.idDiagnosticoExistente })).status, 200);
    });

    it("sin tratamiento también se puede cargar un diagnóstico nuevo", async () => {
        const r0 = await ingreso("20154984", { motivo: "F4", prioridad: "rojo" });
        await cuddy.patch(`/urgencias/${r0.data.urgencia.idAtencion}/atender`);
        const r = await cuddy.patch(`/urgencias/${r0.data.urgencia.idAtencion}/finalizar`, { nuevoDiagnostico: { nombreDiagnostico: "Sin tratamiento " + Date.now() } });
        assert.equal(r.status, 200, JSON.stringify(r.data));
    });
});

describe("Cancelar", () => {
    it("ADMIN cancela una urgencia en espera; no se cancela dos veces; el MÉDICO solo las que atiende", async () => {
        for (const u of (await admin.get("/urgencias/guardia")).data) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
        const a = (await ingreso("47076568", { motivo: "C1", prioridad: "rojo" })).data.urgencia.idAtencion;
        const b = (await ingreso("7248513", { motivo: "C2", prioridad: "verde" })).data.urgencia.idAtencion;

        assert.equal((await cuddy.patch(`/urgencias/${b}/cancelar`)).status, 403, "el médico no cancela las que no atiende");
        assert.equal((await admin.patch(`/urgencias/${b}/cancelar`)).data.urgencia.estado, "cancelada");
        assert.equal((await admin.patch(`/urgencias/${b}/cancelar`)).status, 400);

        await cuddy.patch(`/urgencias/${a}/atender`);
        assert.equal((await ross.patch(`/urgencias/${a}/cancelar`)).status, 403);
        assert.equal((await cuddy.patch(`/urgencias/${a}/cancelar`)).data.urgencia.estado, "cancelada");
        assert.deepEqual(await esperaComo(), []);
    });
});


// ================================================================ 4b) Tipo «Otro» con descripción opcional
describe("Tipo «Otro»: descripción opcional que solo vive con ese tipo", () => {
    const fila = async (id) => (await filas("SELECT idTipo, detalleTipo, motivo FROM atencion WHERE idAtencion = ?", [id]))[0];
    const nuevo = async (extra) => {
        const r = await ingreso("47076568", { motivo: "otro-test", prioridad: "verde", ...extra });
        assert.equal(r.status, 201, JSON.stringify(r.data));
        return r.data.urgencia;
    };
    before(async () => {
        for (const u of (await admin.get("/urgencias/guardia")).data) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
    });

    it("«Otro» con descripción: se guarda la descripción y el tipo sigue siendo «Otro»", async () => {
        const u = await nuevo({ idTipo: tipos["Otro"], detalleTipo: "  Picadura de insecto con hinchazón  " });
        assert.equal(u.tipoUrgencia.nombre, "Otro");
        assert.equal(u.detalleTipo, "Picadura de insecto con hinchazón", "se guarda sin espacios sobrantes");
        const f = await fila(u.idAtencion);
        assert.equal(f.idTipo, tipos["Otro"], "el tipo no fue reemplazado por la descripción");
        assert.equal(f.motivo, "otro-test", "el motivo tampoco se tocó");
    });

    it("«Otro» SIN descripción (omitida, vacía o solo espacios): se registra igual, con detalleTipo = null", async () => {
        for (const extra of [{}, { detalleTipo: "" }, { detalleTipo: "    " }, { detalleTipo: null }]) {
            const u = await nuevo({ idTipo: tipos["Otro"], ...extra });
            assert.equal((await fila(u.idAtencion)).detalleTipo, null, JSON.stringify(extra));
        }
    });

    it("con cualquier OTRO tipo, una descripción que llegue por error NO se guarda", async () => {
        const u = await nuevo({ idTipo: tipos["Corte"], detalleTipo: "no debería quedar" });
        assert.equal((await fila(u.idAtencion)).detalleTipo, null);
        assert.equal(u.detalleTipo ?? null, null);
    });

    it("máximo 150 caracteres: con «Otro» pasarse da 400; con otro tipo se ignora y no molesta", async () => {
        const largo = "x".repeat(151);
        const r = await ingreso("47076568", { motivo: "x", prioridad: "verde", idTipo: tipos["Otro"], detalleTipo: largo });
        assert.equal(r.status, 400);
        assert.match(r.data.message, /150/);
        const justo = await nuevo({ idTipo: tipos["Otro"], detalleTipo: "x".repeat(150) });
        assert.equal((await fila(justo.idAtencion)).detalleTipo.length, 150);
        assert.equal((await ingreso("47076568", { motivo: "x", prioridad: "verde", idTipo: tipos["Corte"], detalleTipo: largo })).status, 201);
    });

    it("EDITAR: de «Otro» a otro tipo la descripción se borra, y al volver a «Otro» no reaparece", async () => {
        const u = await nuevo({ idTipo: tipos["Otro"], detalleTipo: "descripción original" });
        const r1 = await admin.put(`/urgencias/${u.idAtencion}`, { idTipo: tipos["Corte"] });
        assert.equal(r1.status, 200);
        assert.equal((await fila(u.idAtencion)).detalleTipo, null, "se borró al cambiar de tipo");
        const r2 = await admin.put(`/urgencias/${u.idAtencion}`, { idTipo: tipos["Otro"] });
        assert.equal(r2.status, 200);
        assert.equal((await fila(u.idAtencion)).detalleTipo, null, "no resucita al volver a «Otro»");
        const r3 = await admin.put(`/urgencias/${u.idAtencion}`, { idTipo: tipos["Otro"], detalleTipo: "descripción nueva" });
        assert.equal(r3.data.detalleTipo, "descripción nueva");
    });

    it("EDITAR: cambiar solo el motivo o la prioridad conserva la descripción; vaciarla la borra", async () => {
        const u = await nuevo({ idTipo: tipos["Otro"], detalleTipo: "se conserva" });
        await admin.put(`/urgencias/${u.idAtencion}`, { motivo: "motivo nuevo", prioridad: "amarillo" });
        assert.equal((await fila(u.idAtencion)).detalleTipo, "se conserva");
        await admin.put(`/urgencias/${u.idAtencion}`, { detalleTipo: "" });
        assert.equal((await fila(u.idAtencion)).detalleTipo, null);
    });

    it("EDITAR: una descripción para una urgencia que NO es «Otro» se ignora", async () => {
        const u = await nuevo({ idTipo: tipos["Fractura"] });
        const r = await admin.put(`/urgencias/${u.idAtencion}`, { detalleTipo: "no corresponde" });
        assert.equal(r.status, 200);
        assert.equal((await fila(u.idAtencion)).detalleTipo, null);
    });

    it("la lista de la guardia y el historial devuelven la descripción", async () => {
        const dni = dniNuevo();
        const u = await ingreso(dni, { nombre: "Otra", apellido: "Urgencia", idTipo: tipos["Otro"], detalleTipo: "visible en listas", prioridad: "rojo", motivo: "para-listas" });
        const enLista = (await admin.get("/urgencias/guardia")).data.find((x) => x.idAtencion === u.data.urgencia.idAtencion);
        assert.equal(enLista.detalleTipo, "visible en listas");
        const h = (await admin.get(`/atenciones/historial/dni/${dni}`)).data.atenciones[0];
        assert.equal(h.detalleTipo, "visible en listas");
        assert.equal(h.tipoUrgencia.nombre, "Otro");
    });

    it("las consultas (turnos) no tienen descripción de tipo: el campo no aparece", async () => {
        const consultas = (await admin.get("/atenciones")).data;
        assert.ok(consultas.length > 0);
        assert.ok(consultas.every((c) => c.detalleTipo === undefined));
    });
});


// ================================================================ 5) Historial y pantallas de turnos
describe("Historial Clínico incluye urgencias; las pantallas de turnos siguen viendo solo consultas", () => {
    const dniH = dniNuevo();
    let idH, medicoCuddy;

    before(async () => {
        for (const u of (await admin.get("/urgencias/guardia")).data) await admin.patch(`/urgencias/${u.idAtencion}/cancelar`);
        const r = await ingreso(dniH, { nombre: "Hilda", apellido: "Historial", motivo: "para-historial", prioridad: "amarillo", idTipo: tipos["Fractura"] });
        idH = r.data.urgencia.paciente.idPaciente;
        const id = r.data.urgencia.idAtencion;
        await cuddy.patch(`/urgencias/${id}/atender`);
        await cuddy.patch(`/urgencias/${id}/finalizar`, { idDiagnostico: 5 });
        medicoCuddy = (await cuddy.get("/login/me")).data.usuario.matricula;
    });

    it("el PACIENTE ve su urgencia en su Historial, identificada como tal", async () => {
        const pac = cliente(); assert.equal((await pac.login(dniH, dniH)).status, 200);
        const r = await pac.get(`/atenciones/historial/paciente/${idH}`);
        assert.equal(r.status, 200);
        const u = r.data.atenciones.find((a) => a.tipoAtencion === "urgencia");
        assert.ok(u, "aparece la urgencia");
        assert.equal(u.motivo, "para-historial");
        assert.equal(u.prioridad, "amarillo");
        assert.equal(u.tipoUrgencia.nombre, "Fractura");
        assert.equal(u.estado, "finalizada");
        assert.equal(u.diagnostico.idDiagnostico, 5);
        assert.equal(u.medico.apellido, "Cuddy");
        assert.equal(u.medico.especialidad.nombreEspecialidad, "Medicina General");
    });

    it("el paciente no puede ver el historial de otro", async () => {
        const pac = cliente(); await pac.login(dniH, dniH);
        assert.equal((await pac.get("/atenciones/historial/paciente/1")).status, 403);
        assert.equal((await pac.get("/atenciones/historial/dni/47076568")).status, 403);
    });

    it("ADMIN y MÉDICO buscan por DNI (con puntos) y ven consultas y urgencias juntas", async () => {
        for (const quien of [admin, cuddy]) {
            const r = await quien.get(`/atenciones/historial/dni/${conPuntos(dniH)}`);
            assert.equal(r.status, 200);
            assert.equal(r.data.paciente.dni, dniH);
            assert.equal(r.data.atenciones.length, 1);
        }
        // Juan Perez (47076568) tiene una consulta (datos de prueba) y las urgencias que crearon las pruebas anteriores
        const j = (await admin.get("/atenciones/historial/dni/47.076.568")).data;
        const tipos2 = j.atenciones.map((a) => a.tipoAtencion);
        assert.ok(tipos2.includes("consulta"));
        assert.ok(tipos2.includes("urgencia"));
        const fechas = j.atenciones.map((a) => a.fechaAtencion);
        assert.deepEqual(fechas, [...fechas].sort().reverse(), "de la más nueva a la más vieja");
    });

    it("historial por DNI: inexistente 404, inválido 400, paciente sin atenciones 200 vacío", async () => {
        assert.equal((await admin.get(`/atenciones/historial/dni/${dniNuevo()}`)).status, 404);
        assert.equal((await admin.get("/atenciones/historial/dni/xx")).status, 400);
        const sin = dniNuevo();
        await anon.post("/pacientes", { nombre: "Sin", apellido: "Atenciones", dni: sin, nombreUsuario: "sin" + sin, password: "clave123", idObra: null });
        const r = await admin.get(`/atenciones/historial/dni/${sin}`);
        assert.equal(r.status, 200);
        assert.deepEqual(r.data.atenciones, []);
    });

    it("MIS TURNOS (/atenciones/paciente/:id) no trae urgencias", async () => {
        const r = await admin.get(`/atenciones/paciente/${idH}`);
        assert.equal(r.status, 200);
        assert.deepEqual(r.data, [], "Hilda solo tiene una urgencia");
        const j = (await admin.get("/atenciones/paciente/1")).data;     // Juan Perez tiene 1 consulta y 1 urgencia
        assert.ok(j.length >= 1);
        assert.ok(j.every((a) => a.tipoAtencion === "consulta"));
    });

    it("la AGENDA del médico no trae urgencias (aunque las haya atendido él)", async () => {
        const r = await admin.get(`/atenciones/medico/${medicoCuddy}`);
        assert.equal(r.status, 200);
        assert.ok(r.data.every((a) => a.tipoAtencion === "consulta"));
        const propia = await cuddy.get(`/atenciones/medico/${medicoCuddy}`);
        assert.equal(propia.status, 200);
        assert.ok(propia.data.every((a) => a.tipoAtencion === "consulta"));
    });

    it("los REPORTES (/atenciones/buscar) y /atenciones no traen urgencias, con y sin filtros", async () => {
        for (const ruta of ["/atenciones/buscar", `/atenciones/buscar?matricula=${medicoCuddy}`, "/atenciones/buscar?fecha=" + new Date().toISOString().slice(0, 10), "/atenciones"]) {
            const r = await admin.get(ruta);
            assert.equal(r.status, 200, ruta);
            assert.ok(r.data.every((a) => a.tipoAtencion === "consulta"), ruta);
        }
        const comoMedico = await cuddy.get("/atenciones/buscar");
        assert.equal(comoMedico.status, 200);
        assert.ok(comoMedico.data.every((a) => a.tipoAtencion === "consulta"));
    });

    it("los turnos siguen funcionando: reservar, aparecer en Mis turnos y cancelar", async () => {
        const pac = cliente(); await pac.login("user2", "dos222");
        const fecha = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
        const hora = String(10 + (Date.now() % 8)).padStart(2, "0") + ":" + String(Date.now() % 60).padStart(2, "0");
        const r = await pac.post("/atenciones", { matriculaMedico: 1, fechaAtencion: fecha, horaAtencion: hora });
        assert.equal(r.status, 201, JSON.stringify(r.data));
        const idTurno = r.data.atencion.idAtencion;
        const [row] = await filas("SELECT tipoAtencion, matricula, estado FROM atencion WHERE idAtencion = ?", [idTurno]);
        assert.equal(row.tipoAtencion, "consulta");
        const mis = (await pac.get("/atenciones/paciente/2")).data;
        assert.ok(mis.some((t) => t.idAtencion === idTurno));
        assert.equal((await pac.patch(`/atenciones/${idTurno}/cancelar`)).status, 200);
        // un turno no se puede "atender" por la ruta de urgencias ni una urgencia por la de turnos
        const urg = (await ingreso("47076568", { motivo: "cruce", prioridad: "rojo" })).data.urgencia.idAtencion;
        assert.equal((await admin.patch(`/atenciones/${urg}/estado`, { estado: "atendido" })).status, 404, "una urgencia no se toca desde las rutas de turnos");
        assert.equal((await cuddy.patch(`/urgencias/${idTurno}/atender`)).status, 404, "un turno no se toca desde las rutas de urgencias");
        await admin.patch(`/urgencias/${urg}/cancelar`);
    });
});
