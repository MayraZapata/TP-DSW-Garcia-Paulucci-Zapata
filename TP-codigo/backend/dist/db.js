import mysql from "mysql2";
const conexion = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Clifor378",
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
//# sourceMappingURL=db.js.map