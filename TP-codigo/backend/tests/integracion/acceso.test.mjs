import { test, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../dist/app.js";
import { orm } from "../../dist/shared/orm.js";



after(async () => {
    await orm.close();
});



async function iniciarSesion(usuario, password) {
    const agente = request.agent(app);
    const login = await agente.post("/api/login").send({ usuario, password });
    assert.equal(login.status, 200);
    return { agente, login };
}



test("GET /api/obrasSociales es público y devuelve una lista", async () => {
    const res = await request(app).get("/api/obrasSociales");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
});



test("login con contraseña incorrecta responde 401", async () => {
    const res = await request(app)
        .post("/api/login")
        .send({ usuario: "admin", password: "contraseña-incorrecta" });
    assert.equal(res.status, 401);
});



test("sin iniciar sesión, una ruta protegida responde 401", async () => {
    const res = await request(app).get("/api/pacientes");
    assert.equal(res.status, 401);
});



test("un paciente logueado NO puede listar pacientes (403)", async () => {
    const { agente, login } = await iniciarSesion("user1", "uno111");
    assert.equal(login.body.rol, "PACIENTE");
    const res = await agente.get("/api/pacientes");
    assert.equal(res.status, 403);
});



test("un administrador logueado SÍ puede listar pacientes (200)", async () => {
    const { agente, login } = await iniciarSesion("admin", "admin123");
    assert.equal(login.body.rol, "ADMIN");
    const res = await agente.get("/api/pacientes");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
});



test("un paciente ve SUS datos pero NO los de otro paciente (403)", async () => {
    const { agente, login } = await iniciarSesion("user1", "uno111");
    const miId = login.body.usuario.idPaciente;
    const propio = await agente.get(`/api/pacientes/${miId}`);
    assert.equal(propio.status, 200);
    const ajeno = await agente.get(`/api/pacientes/${miId + 1}`);
    assert.equal(ajeno.status, 403);
});




test("/api/login/me devuelve la sesión y logout la cierra", async () => {
    const { agente } = await iniciarSesion("admin", "admin123");
    const me = await agente.get("/api/login/me");
    assert.equal(me.status, 200);
    assert.equal(me.body.rol, "ADMIN");
    const logout = await agente.post("/api/login/logout");
    assert.equal(logout.status, 204);
    const despues = await agente.get("/api/login/me");
    assert.equal(despues.status, 401);
});
