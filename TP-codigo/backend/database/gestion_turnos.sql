
/*Creación y uso de la Base de datos*/
CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gestion_turnos` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE gestion_turnos;



/*Eliminación de tablas para reiniciar la base de datos*/
DROP TABLE IF EXISTS `atencion`;
DROP TABLE IF EXISTS `medico`;
DROP TABLE IF EXISTS `paciente`;
DROP TABLE IF EXISTS `tipoUrgencia`;
DROP TABLE IF EXISTS `diagnostico`;
DROP TABLE IF EXISTS `obraSocial`;
DROP TABLE IF EXISTS `especialidad`;
DROP TABLE IF EXISTS `administrador`;




/*Crear tabla Especialidad*/
CREATE TABLE IF NOT EXISTS especialidad (

    idEspecialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombreEspecialidad VARCHAR(50) NOT NULL,
    descripcion VARCHAR(300)
);
/*Cargar especialidad*/
INSERT INTO especialidad (nombreEspecialidad, descripcion) VALUES ('infectologia', 'Especialidad en enfermedades infecciosas'), ('Cardiologia', 'Especialidad en enfermedades del corazón'), ('oncología', 'Especialidad en enfermedades oncológicas'), ('Neurologia', 'Especialidad en enfermedades del sistema nervioso');



/*Crear tabla ObraSocial*/
CREATE TABLE IF NOT EXISTS obraSocial (

    idObra INT AUTO_INCREMENT PRIMARY KEY,
    nombreObra VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL
);
/*Cargar Obra Social*/
INSERT INTO ObraSocial (nombreObra, monto) VALUES ('Previnca', 1200.00), ('OSDE', 1500.00), ('Swiss Medical', 2000.00), ('Medife', 1800.00), ('Sancor Salud', 1400.00);


/*Crear tabla Paciente*/
CREATE TABLE IF NOT EXISTS paciente (
    idPaciente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    idObra INT,
    FOREIGN KEY(idObra)
        REFERENCES ObraSocial(idObra)
);
/*Cargar paciente*/
INSERT INTO paciente (nombre, apellido, dni, nombreUsuario, password, idObra) VALUES ('Juan', 'Perez', '47076568','user1','uno111', 1), ('Marcelo', 'Tinelli', '7248513','user2','dos222', null), ('Roberto', 'Musso', ' 7915420','user3','tres333', 2), ('Juanito', 'Alcachofa', '39135893','user4','cuatro444', 3), ('Tim', 'Payne', '26156284','user5','cinco555', 4), ('Thomas ', 'Holland', '39641855','user6','seis666', 2), ('Stanley', 'Pines', '20154984','user7','siete777', null);


/*Crear tabla Medico*/
CREATE TABLE IF NOT EXISTS medico (
    matricula INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    idEspecialidad INT,
    FOREIGN KEY(idEspecialidad)
        REFERENCES Especialidad(idEspecialidad)
);
/*Cargar medico*/
INSERT INTO medico (nombre, apellido, nombreUsuario, password, idEspecialidad) VALUES ('Gregory', 'House', 'drHouse','uno111', 1), ('Stephen', 'Strange', 'drStrange','dos222', 4), ('Meredith', 'Grey', 'drGrey','tres333', 4), ('John', 'Watson', 'drWatson','cuatro444', 2), ('James', 'Wilson', 'drWilson','cinco555', 3);


/*Crear tabla Administrador*/
CREATE TABLE IF NOT EXISTS administrador (
    idAdministrador INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);
/*Cargar administrador*/
INSERT INTO administrador (nombre, nombreUsuario, password) VALUES ('Administrador Principal', 'admin', 'admin123');




/*Crear tabla Diagnostico*/
CREATE TABLE IF NOT EXISTS diagnostico (

    idDiagnostico INT AUTO_INCREMENT PRIMARY KEY,
    nombreDiagnostico VARCHAR(100) NOT NULL ,
    tratamiento VARCHAR(300) NOT NULL
);
INSERT INTO diagnostico (nombreDiagnostico, tratamiento) VALUES 
('Gripe Común', 'Reposo, hidratación constante y paracetamol cada 8 horas si hay fiebre.'),
('Hipertensión Arterial', 'Dieta baja en sodio, ejercicio moderado y enalapril 10mg diario.'),
('Migraña Severa', 'Evitar estímulos luminosos, reposo en habitación oscura y sumatriptán 50mg.'),
('Infección Urinaria', 'Tomar abundante agua y tratamiento con antibiótico (Amoxicilina) por 7 días.'),
('Esguince de Tobillo', 'Inmovilización relativa, aplicación de hielo local y antiinflamatorios.');




/*Crear tabla TipoUrgencia*/
CREATE TABLE IF NOT EXISTS tipoUrgencia (

    idTipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcionTipo VARCHAR(100)
);
INSERT INTO tipoUrgencia (nombre, descripcionTipo) VALUES 
('Verde / No Urgente', 'Condiciones menores que pueden esperar atención sin riesgo de empeorar.'),
('Amarillo / Urgencia', 'Requiere atención médica rápida pero la vida del paciente no peligra inmediatamente.'),
('Rojo / Emergencia', 'Riesgo vital inminente. Requiere atención médica e intervención inmediata.');





/*Crear tabla Atención*/
CREATE TABLE IF NOT EXISTS atencion (

    idAtencion INT AUTO_INCREMENT PRIMARY KEY,
    fechaAtencion DATE NOT NULL,
    horaAtencion TIME NOT NULL,
    nroIngreso INT NOT NULL,
    idPaciente INT NOT NULL,
    matricula INT NOT NULL,
    idDiagnostico INT,
    idTipo INT,
    estado VARCHAR(20),
    FOREIGN KEY(idPaciente)
        REFERENCES paciente(idPaciente),
    FOREIGN KEY(matricula)
        REFERENCES medico(matricula),
    FOREIGN KEY(idDiagnostico)
        REFERENCES Diagnostico(idDiagnostico),
    FOREIGN KEY(idTipo)
        REFERENCES TipoUrgencia(idTipo)
);
INSERT INTO atencion (fechaAtencion, horaAtencion, nroIngreso, idPaciente, matricula, idDiagnostico, idTipo, estado) VALUES 
('2026-10-01', '08:30:00', 1001, 1, 1, 4, 2, 'atendido'),
('2026-10-01', '09:15:00', 1002, 2, 4, 2, 2, 'atendido'),
('2026-10-02', '14:00:00', 1003, 3, 2, 3, 1, 'atendido'),
('2026-10-02', '23:45:00', 1004, 4, 3, 5, 3, 'atendido'),
('2026-10-03', '11:00:00', 1005, 5, 5, 1, 1, 'atendido'),
('2026-10-04', '10:30:00', 1006, 6, 2, NULL, 1, 'Pendiente'),
('2026-10-04', '17:20:00', 1007, 7, 1, NULL, 3, 'Ausente');






/* Usuario común para el TP */
DROP USER IF EXISTS 'UsuarioBD'@'%';
create user UsuarioBD@'%' identified by 'SqlPassword-DSW';
grant select, insert, update, delete on gestion_turnos.* to UsuarioBD@'%';

