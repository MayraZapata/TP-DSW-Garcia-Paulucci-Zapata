SET NAMES utf8mb4;

-- Creación y uso de la Base de datos
CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gestion_turnos` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE gestion_turnos;



-- Eliminación de tablas para reiniciar la base de datos 
DROP TABLE IF EXISTS `atencion`;
DROP TABLE IF EXISTS `medico`;
DROP TABLE IF EXISTS `paciente`;
DROP TABLE IF EXISTS `TipoUrgencia`;
DROP TABLE IF EXISTS `diagnostico`;
DROP TABLE IF EXISTS `ObraSocial`;
DROP TABLE IF EXISTS `especialidad`;
DROP TABLE IF EXISTS `usuario`;





/*
USUARIOS PRECARGADOS: ------------------------------------------------------------------------------------
    Tipo    |   Usuario     |   Contraseña
    admin   |   admin       |    admin123
    Paciente|   user1       |    uno111
    Paciente|   user2       |    dos222
    Paciente|   user3       |    tres333
    Paciente|   user4       |    cuatro444
    Paciente|   user5       |    cinco555
    Paciente|   user6       |    seis666
    Paciente|   user7       |    siete777
    Medico  |   drHouse     |    uno111
    Medico  |   drStrange   |    dos222
    Medico  |   drGrey      |    tres333
    Medico  |   drWatson    |    cuatro444
    Medico  |   drWilson    |    cinco555
    Medico  |   drCuddy     |    seis666
    Medico  |   drRoss      |    siete777
---------------------------------------------------------------------------------------------------------*/ 





-- Usuario
CREATE TABLE IF NOT EXISTS usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    rol ENUM('ADMIN','MEDICO','PACIENTE') NOT NULL
);
INSERT INTO usuario (nombreUsuario, password, rol) VALUES
('admin', 'admin123', 'ADMIN'),
('user1', 'uno111', 'PACIENTE'), ('user2', 'dos222', 'PACIENTE'), ('user3', 'tres333', 'PACIENTE'),
('user4', 'cuatro444', 'PACIENTE'), ('user5', 'cinco555', 'PACIENTE'), ('user6', 'seis666', 'PACIENTE'),
('user7', 'siete777', 'PACIENTE'),
('drHouse', 'uno111', 'MEDICO'), ('drStrange', 'dos222', 'MEDICO'), ('drGrey', 'tres333', 'MEDICO'),
('drWatson', 'cuatro444', 'MEDICO'), ('drWilson', 'cinco555', 'MEDICO'), ('drCuddy', 'seis666', 'MEDICO'),
('drRoss', 'siete777', 'MEDICO');





-- Especialidad
CREATE TABLE IF NOT EXISTS especialidad (

    idEspecialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombreEspecialidad VARCHAR(50) NOT NULL,
    descripcion VARCHAR(300)
);
INSERT INTO especialidad (nombreEspecialidad, descripcion) VALUES ('infectologia', 'Especialidad en enfermedades infecciosas'), ('Cardiologia', 'Especialidad en enfermedades del corazón'), ('oncología', 'Especialidad en enfermedades oncológicas'), ('Neurologia', 'Especialidad en enfermedades del sistema nervioso');



-- Obra Social
CREATE TABLE IF NOT EXISTS ObraSocial (

    idObra INT AUTO_INCREMENT PRIMARY KEY,
    nombreObra VARCHAR(100) NOT NULL,
    monto DECIMAL(10,2) NOT NULL
);
INSERT INTO ObraSocial (nombreObra, monto) VALUES ('Previnca', 1200.00), ('OSDE', 1500.00), ('Swiss Medical', 2000.00), ('Medife', 1800.00), ('Sancor Salud', 1400.00);




-- Paciente
CREATE TABLE IF NOT EXISTS paciente (
    idPaciente INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    dni VARCHAR(20) NOT NULL,   /* siempre sin puntos ni espacios */
    idObra INT,
    UNIQUE KEY uq_paciente_dni (dni),
    FOREIGN KEY(idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY(idObra) REFERENCES ObraSocial(idObra)
);
INSERT INTO paciente (nombre, apellido, dni, idUsuario, idObra) VALUES
('Juan', 'Perez', '47076568', 2, 1),
('Marcelo', 'Tinelli', '7248513', 3, null),
('Roberto', 'Musso', '7915420', 4, 2),
('Juanito', 'Alcachofa', '39135893', 5, 3),
('Tim', 'Payne', '26156284', 6, 4),
('Thomas ', 'Holland', '39641855', 7, 2),
('Stanley', 'Pines', '20154984', 8, null);



-- Medico
CREATE TABLE IF NOT EXISTS medico (
    matricula INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    idEspecialidad INT,
    FOREIGN KEY(idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY(idEspecialidad) REFERENCES especialidad(idEspecialidad)
);
INSERT INTO medico (nombre, apellido, idUsuario, idEspecialidad) VALUES
('Gregory', 'House', 9, 1),
('Stephen', 'Strange', 10, 4),
('Meredith', 'Grey', 11, 4),
('John', 'Watson', 12, 2),
('James', 'Wilson', 13, 3),
('Lisa', 'Cuddy', 14, 4),
('Doug', 'Ross', 15, 3);




-- Diagnostico
CREATE TABLE IF NOT EXISTS diagnostico (

    idDiagnostico INT AUTO_INCREMENT PRIMARY KEY,
    nombreDiagnostico VARCHAR(100) NOT NULL ,
    tratamiento VARCHAR(300) NOT NULL,
    UNIQUE KEY uq_diagnostico_nombre (nombreDiagnostico)
);
INSERT INTO diagnostico (nombreDiagnostico, tratamiento) VALUES 
('Gripe Común', 'Reposo, hidratación constante y paracetamol cada 8 horas si hay fiebre.'),
('Hipertensión Arterial', 'Dieta baja en sodio, ejercicio moderado y enalapril 10mg diario.'),
('Migraña Severa', 'Evitar estímulos luminosos, reposo en habitación oscura y sumatriptán 50mg.'),
('Infección Urinaria', 'Tomar abundante agua y tratamiento con antibiótico (Amoxicilina) por 7 días.'),
('Esguince de Tobillo', 'Inmovilización relativa, aplicación de hielo local y antiinflamatorios.');




-- TipoUrgencia
CREATE TABLE IF NOT EXISTS TipoUrgencia (

    idTipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcionTipo VARCHAR(100)
);
INSERT INTO TipoUrgencia (nombre, descripcionTipo) VALUES
('Convulsiones', 'Episodio convulsivo o pérdida de conocimiento.'),
('Corte', 'Heridas cortantes o lesiones con sangrado.'),
('Fractura', 'Sospecha de fractura o golpe fuerte en huesos y articulaciones.'),
('Dolor de pecho', 'Dolor o presión en el pecho, falta de aire.'),
('Fiebre alta', 'Fiebre persistente o muy elevada.'),
('Otro', 'Otra urgencia que no figura en la lista. Se puede describir brevemente.');





-- Atención
CREATE TABLE IF NOT EXISTS atencion (

    idAtencion INT AUTO_INCREMENT PRIMARY KEY,
    fechaAtencion DATE NOT NULL,
    horaAtencion TIME NOT NULL,
    idPaciente INT NOT NULL,
    matricula INT NULL,
	idDiagnostico INT NULL,
    idTipo INT NULL,  
    estado VARCHAR(20),
    tipoAtencion VARCHAR(20) NOT NULL DEFAULT 'consulta',   
    motivo VARCHAR(300) NULL,                               
    prioridad ENUM('rojo','amarillo','verde') NULL,         
    detalleTipo VARCHAR(150) NULL,                          
    INDEX idx_atencion_guardia (tipoAtencion, estado, prioridad, fechaAtencion, horaAtencion),
    FOREIGN KEY(idPaciente)
        REFERENCES paciente(idPaciente),
    FOREIGN KEY(matricula)
        REFERENCES medico(matricula),
    FOREIGN KEY(idDiagnostico)
        REFERENCES diagnostico(idDiagnostico),
    FOREIGN KEY(idTipo)
        REFERENCES TipoUrgencia(idTipo)
);
INSERT INTO atencion (fechaAtencion, horaAtencion, idPaciente, matricula, idDiagnostico, estado) VALUES 
('2026-10-01', '08:30:00', 1, 1, 4, 'atendido'),
('2026-10-01', '09:15:00', 2, 4, 2, 'atendido'),
('2026-10-02', '14:00:00', 3, 2, 3, 'atendido'),
('2026-10-02', '23:45:00', 4, 3, 5, 'atendido'),
('2026-10-03', '11:00:00', 5, 5, 1, 'atendido'),
('2026-10-04', '10:30:00', 6, 2, NULL, 'Pendiente'),
('2026-10-04', '17:20:00', 7, 1, NULL, 'Ausente');
INSERT INTO atencion (tipoAtencion, fechaAtencion, horaAtencion, idPaciente, matricula, idDiagnostico, idTipo, estado, motivo, prioridad) VALUES
('urgencia', '2026-10-05', '21:40:00', 1, 6, 5, 3, 'finalizada', 'Golpe fuerte en el tobillo, sospecha de fractura', 'verde');






-- Usuario común para el TP 
DROP USER IF EXISTS 'UsuarioBD'@'%';
create user UsuarioBD@'%' identified by 'SqlPassword-DSW';
grant select, insert, update, delete on gestion_turnos.* to UsuarioBD@'%';
