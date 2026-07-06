import mysql from "mysql2";

const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ContraseñaSQL", // Cambiar por la contraseña de tu base de datos
    database: "gestion_turnos"
});

conexion.connect((error) => {

    if (error) {
        console.log(error);
        return;
    }

    console.log("Conectado a MySQL");

});

export default conexion;