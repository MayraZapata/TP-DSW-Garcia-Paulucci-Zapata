import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

if (!process.env.DB_URL) {throw new Error("Falta DB_URL. Ejecutalo con: pnpm hash-passwords");}

const db = await mysql.createConnection(process.env.DB_URL);

const tablas = [
    { tabla: "paciente", id: "idPaciente" },
    { tabla: "medico", id: "matricula" },
    { tabla: "administrador", id: "idAdministrador" },
];

for (const { tabla, id } of tablas) {
    const [filas] = await db.query(`SELECT ${id} AS id, password FROM ${tabla}`);
    for (const f of filas) {
        if (f.password.startsWith("$2")) continue; // ya está hasheada
        const hash = await bcrypt.hash(f.password, 10);
        await db.query(`UPDATE ${tabla} SET password = ? WHERE ${id} = ?`, [hash, f.id]);
    }
    console.log(`${tabla}: listo`);
}

await db.end();