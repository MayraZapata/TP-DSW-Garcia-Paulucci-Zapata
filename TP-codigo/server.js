const conexion = require("./config/db");
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));

console.log("Ruta login cargada");
app.post("/login", (req, res) => {
    const { usuario, password } = req.body;
    conexion.query(
        "SELECT * FROM paciente WHERE usuario = ? AND password = ?",
        [usuario, password],
        (error, pacientes) => {
            if (error) {
                return res.status(500).json(error);
            }
            if (pacientes.length > 0) {
                return res.json({
                    rol: "PACIENTE",
                    nombre: pacientes[0].nombre
                });
            }
            conexion.query(
                "SELECT * FROM medico WHERE usuario = ? AND password = ?",
                [usuario, password],
                (error, medicos) => {
                    if (error) {
                        return res.status(500).json(error);
                    }
                    if (medicos.length > 0) {
                        return res.json({
                            rol: "MEDICO",
                            nombre: medicos[0].nombre
                        });
                    }
                    conexion.query(
                        "SELECT * FROM administrador WHERE usuario = ? AND password = ?",
                        [usuario, password],
                        (error, administradores) => {
                            if (error) {
                                return res.status(500).json(error);
                            }
                            if (administradores.length > 0) {
                                return res.json({
                                    rol: "ADMIN"
                                });
                            }
                            res.status(401).json({
                                mensaje: "Credenciales incorrectas"
                            });
                        }
                    );
                }
            );
        }
    );
});

app.get("/pacientes", (req, res) => {
    conexion.query(
        "SELECT * FROM paciente",
        (error, resultados) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json(resultados);
        }
    );
});

app.post("/pacientes", (req, res) => {
    const { nombre, apellido, dni } = req.body;
    conexion.query(
        "INSERT INTO paciente(nombre, apellido, dni) VALUES (?, ?, ?)",
        [nombre, apellido, dni],
        (error, resultado) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json({
                mensaje: "Paciente creado"
            });
        }
    );
});

app.delete("/pacientes/:id", (req, res) => {
    const id = req.params.id;
    conexion.query(
        "DELETE FROM paciente WHERE id = ?",
        [id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json({
                mensaje: "Paciente eliminado"
            });
        }
    );
});

app.put("/pacientes/:id", (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, dni } = req.body;
    conexion.query(
        `
        UPDATE paciente
        SET nombre = ?, apellido = ?, dni = ?
        WHERE id = ?
        `,
        [nombre, apellido, dni, id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json({
                mensaje: "Paciente actualizado"
            });
        }
    );
});

app.get("/medicos", (req, res) => {
    conexion.query(
        "SELECT * FROM medico",
        (error, resultados) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json(resultados);
        }
    );
});

app.post("/medicos", (req, res) => {
    const { nombre, apellido, dni } = req.body;
    conexion.query(
        "INSERT INTO medico(nombre, apellido, dni) VALUES (?, ?, ?)",
        [nombre, apellido, dni],
        (error, resultado) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json({
                mensaje: "Médico creado"
            });
        }
    );
});

app.delete("/medicos/:id", (req, res) => {
    const id = req.params.id;
    conexion.query(
        "DELETE FROM medico WHERE id = ?",
        [id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json({
                mensaje: "Médico eliminado"
            });
        }
    );
});

app.put("/medicos/:id", (req, res) => {
    const id = req.params.id;
    const { nombre, apellido, dni } = req.body;
    conexion.query(
        `
        UPDATE medico
        SET nombre = ?, apellido = ?, dni = ?
        WHERE id = ?
        `,
        [nombre, apellido, dni, id],
        (error, resultado) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.json({
                mensaje: "Médico actualizado"
            });
        }
    );
});

app.listen(3000, () => {
    console.log("Servidor ejecutándose en puerto 3000");
});

