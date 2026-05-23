# Propuesta TP-DSW-303

## Grupo
### Integrantes
* Garcia, Miqueas Cristián - 55033
* Paulucci, Gino - 53670
* Zapata, Mayra Belén - 42969

### Repositorios
* [frontend app](https://github.com/MayraZapata/TP-DSW-Garcia-Paulucci-Zapata/tree/main/frontend)
* [backend app](https://github.com/MayraZapata/TP-DSW-Garcia-Paulucci-Zapata/tree/main/backend)

## Tema
### Descripción
El sistema propuesto es una aplicación web destinada a la gestión de turnos médicos para un centro de salud. Permite administrar las atenciones entre pacientes y médicos, facilitando la asignación de turnos según disponibilidad y evitando superposición de horarios. La aplicación contempla distintos tipos de usuarios: los administradores registran a los medicos, visualizan el historial clinico del paciente y verifican los turnos vencidos (no asistidos), los pacientes pueden solicitar turnos y los profesionales acceden a la gestión y visualización de sus turnos y pacientes asignados. Además, permite clasificar las atenciones en consultas (las realizadas por turno) o en una urgencia que deba ser registrada por el administrador.

### Modelo de Dominio

```mermaid
classDiagram
class Paciente {
  idPaciente
  nombrePaciente
  apellidoPaciente
  direccion
  telefono
  historialClinico
  fechaNacimiento
  nroDni
}

class Medico {
  matricula
  nombreMedico
  apellidoMedico
}

class Especialidad {
  idEspecialidad
  nombre
  descripción
}

class Atencion {
  idAtencion
  nroIngreso
  fechaAtencion
  horaAtencion
}

class Consulta {
  estado
}

class Urgencia {}

class TipoUrgencia {
  idTipo
  descripciónTipo
}

class Diagnostico {
  idDiagnostico
  nombreDiagnostico
  tratamiento
}

class ObraSocial {
  idObra
  nombreObra
  monto
}

class Usuario {
  contraseña
  idUsuario
  nombreUsuario
}

class Administrador {}

Usuario <|-- Paciente
Usuario <|-- Administrador
Usuario <|-- Medico
ObraSocial "1" --> "0..*" Paciente : pertenece
Paciente "1" --> "0..*" Atencion : solicita
Medico "1" --> "0..*" Atencion : atiende
Diagnostico "0..*" --> "0..*" Atencion 
Especialidad "1" --> "0..*" Medico : pertenece
TipoUrgencia "1" --> "0..*" Urgencia : clasifica
Atencion <|-- Consulta
Atencion <|-- Urgencia


```


## Alcance Funcional 

### Alcance Mínimo
Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD  Paciente<br>2. CRUD Diagnostico<br>3. CRUD Especialidad|
|CRUD dependiente|1. CRUD Urgencia {depende de} CRUD TipoUrgencia<br>2. CRUD Medico {depende de} CRUD Especialidad|
| Listado<br>+<br>detalle | 1. Listado de turnos filtrado por fecha y/o médico → detalle muestra información completa del turno, paciente y médico<br>2. Listado de pacientes → detalle muestra datos del paciente y sus turnos |
| CUU/Epic  | 1. Reservar turno médico de consulta <br>2. Cancelar turno |

Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
| CRUD     | 1. CRUD TipoUrgencia<br>2. CRUD ObraSocial<br>3. CRUD Usuario |
| CUU/Epic | 1. Verificar los estados de turnos por fechas<br>2. Consultar turnos del medico<br>3. Consulta de historial clínico del paciente (visualización de atenciones previas)<br>4. Registrar urgencia |

