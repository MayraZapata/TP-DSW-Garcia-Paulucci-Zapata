
import { test } from "node:test";
import assert from "node:assert/strict";
import { firmarToken, verificarToken } from "../../dist/shared/jwt.js";

test("un token firmado se puede verificar y devuelve el rol y el id", () => {
    const token = firmarToken({ rol: "ADMIN", id: 7 });
    const datos = verificarToken(token);
    assert.equal(datos.rol, "ADMIN");
    assert.equal(datos.id, 7);
});

test("un token alterado es rechazado", () => {
    const token = firmarToken({ rol: "PACIENTE", id: 1 });
    assert.throws(() => verificarToken(token + "x"));
});

test("un texto que no es un token es rechazado", () => {
    assert.throws(() => verificarToken("esto-no-es-un-token"));
});
