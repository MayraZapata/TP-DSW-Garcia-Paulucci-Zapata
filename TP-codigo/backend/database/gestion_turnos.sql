
/* =====================================================================
   BASE DE DATOS DEL SISTEMA - ÚNICO script que hace falta.
   Crea desde cero (borra y vuelve a crear) todas las tablas, con sus datos de prueba.
   No hay migraciones ni scripts aparte: si cambia una entidad, se cambia acá.

   Cómo correrlo, como root (UsuarioBD solo puede select/insert/update/delete):

       mysql -u root -p --default-character-set=utf8mb4 < database/gestion_turnos.sql

   Las contraseñas de prueba ya están encriptadas (bcrypt), no hace falta ningún paso extra:
       admin / admin123 · pacientes user1..user7 / uno111, dos222, ..., siete777
       médicos drHouse, drStrange, drGrey, drWatson, drWilson, drCuddy, drRoss / uno111, dos222, ..., siete777
   ===================================================================== */

/*Que los acentos se carguen bien sin importar el cliente que se use*/
SET NAMES utf8mb4;

/*Creación y uso de la Base de datos*/
CREATE DATABASE /*!32312 IF NOT EXISTS*/ `gestion_turnos` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE gestion_turnos;



/*Eliminación de tablas para reiniciar la base de datos (los nombres son los mismos que usan las entidades)*/
DROP TABLE IF EXISTS `atencion`;
DROP TABLE IF EXISTS `medico`;
DROP TABLE IF EXISTS `paciente`;
DROP TABLE IF EXISTS `TipoUrgencia`;
DROP TABLE IF EXISTS `diagnostico`;
DROP TABLE IF EXISTS `ObraSocial`;
DROP TABLE IF EXISTS `especialidad`;
DROP TABLE IF EXISTS `administrador`;




/*Crear tabla Especialidad*/
CREATE TABLE IF NOT EXISTS especialidad (

    idEspecialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombreEspecialidad VARCHAR(50) NOT NULL,
    descripcion VARCHAR(300)
);
/*Cargar especialidad (todos los médicos pueden atender la guardia, sea cual sea su especialidad)*/
INSERT INTO especialidad (nombreEspecialidad, descripcion) VALUES ('infectologia', 'Especialidad en enfermedades infecciosas'), ('Cardiologia', 'Especialidad en enfermedades del corazón'), ('oncología', 'Especialidad en enfermedades oncológicas'), ('Neurologia', 'Especialidad en enfermedades del sistema nervioso'), ('Medicina General', 'Atención médica general');



/*Crear tabla ObraSocial*/
CREATE TABLE IF NOT EXISTS ObraSocial (

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
    dni VARCHAR(20) NOT NULL,   /* siempre sin puntos ni espacios */
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    idObra INT,
    UNIQUE KEY uq_paciente_dni (dni),
    FOREIGN KEY(idObra)
        REFERENCES ObraSocial(idObra)
);
/*Cargar paciente*/
INSERT INTO paciente (nombre, apellido, dni, nombreUsuario, password, idObra) VALUES
('Juan', 'Perez', '47076568', 'user1', '$2b$10$6xTCxXPBjwqk6ijb7w6EaOCacIuGwP01ZCWeQIeaBt1wyyYvuM5ga', 1),
('Marcelo', 'Tinelli', '7248513', 'user2', '$2b$10$Bec/VcJd5v2vuBNZxo8iieH1Saqmsta..rHWd62dTv8fgy1fWxmJS', null),
('Roberto', 'Musso', '7915420', 'user3', '$2b$10$DY5TXLZRquumjOATQ1blo.yH7r6ZQ/.QsoJTYsk1MyEsayolXCgHq', 2),
('Juanito', 'Alcachofa', '39135893', 'user4', '$2b$10$fRykTqA3CT7QbrNEBkfigunLHZhj986yZda0gpb75WIKQQitdWElK', 3),
('Tim', 'Payne', '26156284', 'user5', '$2b$10$5YtewzjZSCYMMoeJm7Atn.eQwt/9hOooWPadpbqGklxucYRH4GpKK', 4),
('Thomas ', 'Holland', '39641855', 'user6', '$2b$10$B1RUqQv4c/RbwvAriQgM1uJKGlunQAuj/ru1H8BvCsQHrlEnrwp/u', 2),
('Stanley', 'Pines', '20154984', 'user7', '$2b$10$tYNLVFsknuKFrNpR4Dt9N.KNXyzdxIj2LqWo5rfZKJYRJgIZ.FLl6', null);


/*Crear tabla Medico*/
CREATE TABLE IF NOT EXISTS medico (
    matricula INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    idEspecialidad INT,
    FOREIGN KEY(idEspecialidad)
        REFERENCES especialidad(idEspecialidad)
);
/*Cargar medico (Cuddy y Ross son de Medicina General, la especialidad 5)*/
INSERT INTO medico (nombre, apellido, nombreUsuario, password, idEspecialidad) VALUES
('Gregory', 'House', 'drHouse', '$2b$10$DaIQuaklGl7YY5Qi0ITybeHoR/N0ekMuPYI6UVAhuHmcuFWSiWHTS', 1),
('Stephen', 'Strange', 'drStrange', '$2b$10$kJC7VOLGT66WuDAYk4qdvuxkQ64YxR8wLuCBDLw5mujgLp6YiPJuW', 4),
('Meredith', 'Grey', 'drGrey', '$2b$10$yAhZssncSeSWmkR8EdmVjO45IYu3TjZdn/la.OZeGDuIlqAw9eivK', 4),
('John', 'Watson', 'drWatson', '$2b$10$hhF04umuKIb2EIVpkXRq3OSYtWqe2HQgBpUQt4bsTP30gUJvk5Dwy', 2),
('James', 'Wilson', 'drWilson', '$2b$10$rYM3X26iFKteVhjfayUiqek3920Q0FXnJJzUavhubOOR1WMNZMcie', 3),
('Lisa', 'Cuddy', 'drCuddy', '$2b$10$NS6Y3RFU/d9dXh2RlbZE0ucnhUPkpexNpNClkHCuPxA57dkxoM3zG', 5),
('Doug', 'Ross', 'drRoss', '$2b$10$9Beo2Px/NYf51Eu.cINni.EAu1sCXse/Yd3G8Z2R9gPLKk8CZWGk2', 5);


/*Crear tabla Administrador*/
CREATE TABLE IF NOT EXISTS administrador (
    idAdministrador INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    nombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL
);
/*Cargar administrador*/
INSERT INTO administrador (nombre, nombreUsuario, password) VALUES ('Administrador Principal', 'admin', '$2b$10$EfMY7zz7/sGv1vgHgGZoFOf6nnY9JX6/ppYmiq7GTuf49Y0ewfGya');




/*Crear tabla Diagnostico*/
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




/*Crear tabla TipoUrgencia*/
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





/*Crear tabla Atención*/
CREATE TABLE IF NOT EXISTS atencion (

    idAtencion INT AUTO_INCREMENT PRIMARY KEY,
    fechaAtencion DATE NOT NULL,
    horaAtencion TIME NOT NULL,
    idPaciente INT NOT NULL,
    matricula INT NULL,   /* una urgencia en espera todavía no tiene médico */
    idDiagnostico INT,
    idTipo INT NULL,   /* solo urgencias */
    estado VARCHAR(20),
    /* Herencia de tabla única: esta tabla guarda Consultas (por turno) y Urgencias (por guardia) */
    tipoAtencion VARCHAR(20) NOT NULL DEFAULT 'consulta',   /* 'consulta' o 'urgencia' */
    motivo VARCHAR(300) NULL,                               /* solo urgencias */
    prioridad ENUM('rojo','amarillo','verde') NULL,         /* solo urgencias; el orden del ENUM es el orden de atención */
    detalleTipo VARCHAR(150) NULL,                          /* solo urgencias de tipo «Otro»: descripción opcional */
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
/*Una urgencia ya finalizada (para ver cómo aparece en el Historial Clínico). Tipo 6 = Fractura, atendida por la Dra. Cuddy*/
INSERT INTO atencion (tipoAtencion, fechaAtencion, horaAtencion, idPaciente, matricula, idDiagnostico, idTipo, estado, motivo, prioridad) VALUES
('urgencia', '2026-10-05', '21:40:00', 1, 6, 5, 3, 'finalizada', 'Golpe fuerte en el tobillo, sospecha de fractura', 'verde');






/* Usuario común para el TP */
DROP USER IF EXISTS 'UsuarioBD'@'%';
create user UsuarioBD@'%' identified by 'SqlPassword-DSW';
grant select, insert, update, delete on gestion_turnos.* to UsuarioBD@'%';
