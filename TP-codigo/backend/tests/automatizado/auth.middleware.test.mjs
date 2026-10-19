
import { test } from "node:test";
import assert from "node:assert/strict";
import { autenticar, autorizar, soloPropio } from "../../dist/shared/auth.middleware.js";
import { firmarToken } from "../../dist/shared/jwt.js";
import { COOKIE_NAME } from "../../dist/shared/cookie.js";


function crearRes() {
    return {
        codigo: undefined,
        cuerpo: undefined,
        status(c) { this.codigo = c; return this; },
        json(b) { this.cuerpo = b; return this; },
    };
}


function crearNext() {
    const next = () => { next.llamado = true; };
    next.llamado = false;
    return next;
}

test("autorizar('ADMIN') deja pasar a un administrador", () => {
    const req = { auth: { rol: "ADMIN", id: 1 } };
    const res = crearRes();
    const next = crearNext();
    autorizar("ADMIN")(req, res, next);
    assert.equal(next.llamado, true);
    assert.equal(res.codigo, undefined);
});


test("autorizar('ADMIN') rechaza a un paciente con 403", () => {
    const req = { auth: { rol: "PACIENTE", id: 5 } };
    const res = crearRes();
    const next = crearNext();
    autorizar("ADMIN")(req, res, next);
    assert.equal(next.llamado, false);
    assert.equal(res.codigo, 403);
});


test("soloPropio deja a un paciente ver SUS datos", () => {
    const req = { auth: { rol: "PACIENTE", id: 5 }, params: { id: "5" } };
    const res = crearRes();
    const next = crearNext();
    soloPropio("PACIENTE", "id")(req, res, next);
    assert.equal(next.llamado, true);
});



test("soloPropio impide que un paciente vea los datos de OTRO (403)", () => {
    const req = { auth: { rol: "PACIENTE", id: 5 }, params: { id: "9" } };
    const res = crearRes();
    const next = crearNext();
    soloPropio("PACIENTE", "id")(req, res, next);
    assert.equal(next.llamado, false);
    assert.equal(res.codigo, 403);
});



test("autenticar responde 401 si no hay cookie de sesión", () => {
    const req = { cookies: {} };
    const res = crearRes();
    const next = crearNext();
    autenticar(req, res, next);
    assert.equal(next.llamado, false);
    assert.equal(res.codigo, 401);
});


test("autenticar acepta una cookie válida y deja el rol y el id en req.auth", () => {
    const token = firmarToken({ rol: "MEDICO", id: 12 });
    const req = { cookies: { [COOKIE_NAME]: token } };
    const res = crearRes();
    const next = crearNext();
    autenticar(req, res, next);
    assert.equal(next.llamado, true);
    assert.equal(req.auth.rol, "MEDICO");
    assert.equal(req.auth.id, 12);
});
