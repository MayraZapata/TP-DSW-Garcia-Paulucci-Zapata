import { test } from "node:test";           
import assert from "node:assert/strict";    
import { hashPassword, verifyPassword } from "../../dist/shared/password.js";



test("hashPassword no guarda la contraseña en texto plano", async () => {
    const hash = await hashPassword("miClave123");
    assert.notEqual(hash, "miClave123");  
    assert.ok(hash.startsWith("$2"));    // el hash empieza con "$2" (bcrypt)
});


test("verifyPassword acepta la contraseña correcta", async () => {
    const hash = await hashPassword("miClave123");
    assert.equal(await verifyPassword("miClave123", hash), true);
});


test("verifyPassword rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("miClave123");
    assert.equal(await verifyPassword("otraClave", hash), false);
});


test("la misma contraseña genera hashes distintos cada vez (sal aleatoria)", async () => {
    const hash1 = await hashPassword("miClave123");
    const hash2 = await hashPassword("miClave123");
    assert.notEqual(hash1, hash2);
});
