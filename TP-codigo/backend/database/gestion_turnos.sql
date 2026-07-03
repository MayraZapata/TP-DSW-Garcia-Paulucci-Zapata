USE gestion_turnos;


/*Crear tabla Paciente*/
CREATE TABLE IF NOT EXISTS paciente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    dni VARCHAR(20),
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);


/*Cargar paciente*/
INSERT INTO paciente (nombre, apellido, dni, usuario, password) VALUES ('Juan', 'Perez', '20154984','user1','uno111'), ('Marcelo', 'Tinelli', '47065948','user2','dos222');


/*Crear tabla Medico*/
CREATE TABLE IF NOT EXISTS medico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    especialidad VARCHAR(50),
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);


/*Cargar medico*/
INSERT INTO medico (nombre, apellido, especialidad, usuario, password) VALUES ('Gregory', 'House', 'Diagnostico','drHouse','vicodin');


/*Crear tabla Administrador*/
CREATE TABLE IF NOT EXISTS administrador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50),
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);


/*Cargar administrador*/
INSERT INTO administrador (nombre, usuario, password) VALUES ('Administrador Principal', 'admin', 'admin123');


/*Crear tabla Turno*/
CREATE TABLE IF NOT EXISTS turno (

    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME,
    estado VARCHAR(20),
    idPaciente INT,
    idMedico INT,
    FOREIGN KEY(idPaciente)
        REFERENCES paciente(id),
    FOREIGN KEY(idMedico)
        REFERENCES medico(id)
);