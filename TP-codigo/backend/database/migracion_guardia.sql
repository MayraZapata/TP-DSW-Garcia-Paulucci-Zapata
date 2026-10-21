/* =====================================================================
   MIGRACIÓN - Módulo de Guardia / Urgencias
   ---------------------------------------------------------------------
   CÓMO CORRERLO (UNA SOLA VEZ POR BASE, SIEMPRE ANTES DE ARRANCAR EL
   BACKEND NUEVO):

       mysql -u root -p --default-character-set=utf8mb4 < migracion_guardia.sql

   - Hay que correrlo como root (el usuario de la app UsuarioBD solo tiene
     select/insert/update/delete y NO puede cambiar el esquema).
   - Es REPETIBLE: si ya se corrió, no rompe nada ni pisa datos. Cada paso
     mira primero si el cambio ya existe antes de hacerlo.
   - No borra ni modifica turnos ni usuarios existentes (salvo limpiar los
     puntos/espacios del DNI de los pacientes, ver paso 1).
   - Si el paso 1 falla con "Duplicate entry ... uq_paciente_dni" es porque
     hay DOS pacientes con el mismo DNI (ignorando puntos y espacios).
     Resolverlo a mano (borrar o corregir uno) y volver a correr el script.
   - Al final devuelve una tabla de verificación: todo debe decir OK.
   ===================================================================== */

SET NAMES utf8mb4;
USE gestion_turnos;


/* ---------------------------------------------------------------------
   PASO 1 - DNI de pacientes: limpio (sin puntos ni espacios) y ÚNICO.
   Va primero porque es el único paso que puede fallar (si ya hay
   pacientes repetidos); así, si falla, el resto del esquema no se toca.
   --------------------------------------------------------------------- */
UPDATE paciente
   SET dni = REPLACE(REPLACE(REPLACE(TRIM(dni), ' ', ''), '.', ''), CHAR(9), '')
 WHERE dni <> REPLACE(REPLACE(REPLACE(TRIM(dni), ' ', ''), '.', ''), CHAR(9), '');

/* Informativo: si devuelve filas, esos DNI están repetidos y el índice único fallará */
SELECT dni AS dni_repetido, COUNT(*) AS cantidad, GROUP_CONCAT(idPaciente) AS idsPaciente
  FROM paciente
 GROUP BY dni
HAVING COUNT(*) > 1;

SET @existe := (SELECT COUNT(*) FROM information_schema.statistics
                 WHERE table_schema = DATABASE() AND table_name = 'paciente' AND index_name = 'uq_paciente_dni');
SET @sql := IF(@existe = 0, 'ALTER TABLE paciente ADD UNIQUE INDEX uq_paciente_dni (dni)', 'DO 0');
PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;


/* ---------------------------------------------------------------------
   PASO 2 - Diagnóstico: el nombre no se puede repetir (al finalizar una
   urgencia se puede cargar un diagnóstico nuevo en el momento).
   --------------------------------------------------------------------- */
SET @existe := (SELECT COUNT(*) FROM information_schema.statistics
                 WHERE table_schema = DATABASE() AND table_name = 'diagnostico' AND index_name = 'uq_diagnostico_nombre');
SET @sql := IF(@existe = 0, 'ALTER TABLE diagnostico ADD UNIQUE INDEX uq_diagnostico_nombre (nombreDiagnostico)', 'DO 0');
PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;


/* ---------------------------------------------------------------------
   PASO 3 - Tabla atencion: ahora guarda Consultas (por turno) y
   Urgencias (por guardia) en UNA sola tabla (herencia de tabla única).
   --------------------------------------------------------------------- */

/* 3.a) Columna que distingue el tipo. Todo lo que ya existe queda como 'consulta'. */
SET @existe := (SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND column_name = 'tipoAtencion');
SET @sql := IF(@existe = 0,
               "ALTER TABLE atencion ADD COLUMN tipoAtencion VARCHAR(20) NOT NULL DEFAULT 'consulta'",
               'DO 0');
PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;

/* 3.b) Motivo de la urgencia (solo se completa en las urgencias) */
SET @existe := (SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND column_name = 'motivo');
SET @sql := IF(@existe = 0, 'ALTER TABLE atencion ADD COLUMN motivo VARCHAR(300) NULL', 'DO 0');
PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;

/* 3.c) Prioridad de la urgencia: la decide una persona, NO sale del tipo.
        OJO: el orden de los valores del ENUM es el orden de atención
        (rojo primero). MySQL ordena los ENUM por su posición, no por el texto. */
SET @existe := (SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND column_name = 'prioridad');
SET @sql := IF(@existe = 0,
               "ALTER TABLE atencion ADD COLUMN prioridad ENUM('rojo','amarillo','verde') NULL",
               'DO 0');
PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;

/* 3.d) Una urgencia en espera todavía no tiene médico: matricula pasa a aceptar NULL
        (las consultas siguen exigiendo médico desde el backend). Es idempotente. */
ALTER TABLE atencion MODIFY matricula INT NULL;

/* 3.e) Índice para armar rápido la lista de espera */
SET @existe := (SELECT COUNT(*) FROM information_schema.statistics
                 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND index_name = 'idx_atencion_guardia');
SET @sql := IF(@existe = 0,
               'ALTER TABLE atencion ADD INDEX idx_atencion_guardia (tipoAtencion, estado, prioridad, fechaAtencion, horaAtencion)',
               'DO 0');
PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;


/* ---------------------------------------------------------------------
   PASO 4 - Especialidades habilitadas para atender la guardia.
   Es un dato (no código): para habilitar otra especialidad alcanza con
   ponerle atiendeGuardia = 1 (desde "Gestión de Especialidades" o con un UPDATE).
   Solo la PRIMERA vez (cuando la columna todavía no existe) se crea
   "Medicina General" si falta y se la deja habilitada. Si más adelante
   alguien la deshabilita, volver a correr el script NO lo revierte.
   --------------------------------------------------------------------- */
SET @existe := (SELECT COUNT(*) FROM information_schema.columns
                 WHERE table_schema = DATABASE() AND table_name = 'especialidad' AND column_name = 'atiendeGuardia');
SET @primera_vez := IF(@existe = 0, 1, 0);
SET @sql := IF(@existe = 0,
               'ALTER TABLE especialidad ADD COLUMN atiendeGuardia TINYINT(1) NOT NULL DEFAULT 0',
               'DO 0');
PREPARE paso FROM @sql; EXECUTE paso; DEALLOCATE PREPARE paso;

INSERT INTO especialidad (nombreEspecialidad, descripcion)
SELECT 'Medicina General', 'Atención médica general y de guardia'
  FROM DUAL
 WHERE @primera_vez = 1
   AND NOT EXISTS (SELECT 1 FROM especialidad WHERE nombreEspecialidad = 'Medicina General');

UPDATE especialidad
   SET atiendeGuardia = 1
 WHERE @primera_vez = 1
   AND nombreEspecialidad = 'Medicina General';


/* ---------------------------------------------------------------------
   VERIFICACIÓN - todas las filas deben decir OK
   --------------------------------------------------------------------- */
SELECT 'atencion.tipoAtencion existe' AS comprobacion,
       IF(COUNT(*) = 1, 'OK', 'FALTA') AS resultado
  FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND column_name = 'tipoAtencion'
UNION ALL
SELECT 'atencion.motivo existe', IF(COUNT(*) = 1, 'OK', 'FALTA')
  FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND column_name = 'motivo'
UNION ALL
SELECT 'atencion.prioridad existe (rojo,amarillo,verde)', IF(COUNT(*) = 1, 'OK', 'FALTA')
  FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND column_name = 'prioridad'
   AND column_type = "enum('rojo','amarillo','verde')"
UNION ALL
SELECT 'atencion.matricula acepta NULL', IF(COUNT(*) = 1, 'OK', 'FALTA')
  FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND column_name = 'matricula' AND is_nullable = 'YES'
UNION ALL
SELECT 'atencion: índice de la lista de espera', IF(COUNT(*) > 0, 'OK', 'FALTA')
  FROM information_schema.statistics
 WHERE table_schema = DATABASE() AND table_name = 'atencion' AND index_name = 'idx_atencion_guardia'
UNION ALL
SELECT 'paciente.dni único', IF(COUNT(*) > 0, 'OK', 'FALTA')
  FROM information_schema.statistics
 WHERE table_schema = DATABASE() AND table_name = 'paciente' AND index_name = 'uq_paciente_dni' AND non_unique = 0
UNION ALL
SELECT 'paciente.dni sin puntos ni espacios', IF(COUNT(*) = 0, 'OK', 'FALTA')
  FROM paciente
 WHERE dni REGEXP '[ .]'
UNION ALL
SELECT 'diagnostico.nombreDiagnostico único', IF(COUNT(*) > 0, 'OK', 'FALTA')
  FROM information_schema.statistics
 WHERE table_schema = DATABASE() AND table_name = 'diagnostico' AND index_name = 'uq_diagnostico_nombre' AND non_unique = 0
UNION ALL
SELECT 'especialidad.atiendeGuardia existe', IF(COUNT(*) = 1, 'OK', 'FALTA')
  FROM information_schema.columns
 WHERE table_schema = DATABASE() AND table_name = 'especialidad' AND column_name = 'atiendeGuardia'
UNION ALL
SELECT 'especialidad Medicina General existe',
       IF(COUNT(*) >= 1, 'OK', 'FALTA')
  FROM especialidad
 WHERE nombreEspecialidad = 'Medicina General';

/* Resumen informativo: cuántas atenciones hay de cada tipo (por ahora todas 'consulta') */
SELECT tipoAtencion, COUNT(*) AS cantidad FROM atencion GROUP BY tipoAtencion;
