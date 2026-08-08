// Carga inicial al abrir la página
document.addEventListener("DOMContentLoaded", () => {
  cargarEspecialidades();
  autocompletarPaciente();
});

// 1. Cargar especialidades eliminando duplicados
async function cargarEspecialidades() {
  try {
    const respuesta = await fetch("/api/especialidades");
    const especialidades = await respuesta.json();
    const select = document.getElementById("idEspecialidad");

    select.innerHTML = '<option value="">-- Seleccionar Especialidad --</option>';

    // Filtramos duplicados comparando por NOMBRE en minúsculas
    const nombresVistos = new Set();
    
    especialidades.forEach(esp => {
      const nombreLimpio = esp.nombreEspecialidad.trim().toLowerCase();
      if (!nombresVistos.has(nombreLimpio)) {
        nombresVistos.add(nombreLimpio);
        
        const option = document.createElement("option");
        option.value = esp.idEspecialidad;
        option.textContent = esp.nombreEspecialidad;
        select.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error al cargar especialidades:", error);
  }
}

// 2. Cargar médicos según la especialidad elegida
async function cargarMedicosPorEspecialidad() {
  const idEspecialidad = document.getElementById("idEspecialidad").value;
  const selectMedico = document.getElementById("matriculaMedico");

  if (!idEspecialidad) {
    selectMedico.innerHTML = '<option value="">-- Primero seleccione una especialidad --</option>';
    return;
  }

  try {
    const respuesta = await fetch(`/api/medicos/especialidad/${idEspecialidad}`);
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.message || "No hay médicos para esa especialidad");
      selectMedico.innerHTML = '<option value="">-- Sin médicos disponibles --</option>';
      return;
    }

    selectMedico.innerHTML = '<option value="">-- Seleccionar Médico --</option>';
    datos.forEach(medico => {
      const option = document.createElement("option");
      option.value = medico.matricula;
      option.textContent = `Dr/a. ${medico.nombre} ${medico.apellido}`;
      selectMedico.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar médicos:", error);
  }
}

// 3. Autocompletar el paciente si hay sesión iniciada (Sin listar a los demás)
function autocompletarPaciente() {
  const rol = localStorage.getItem("rol");
  const usuarioGuardado = localStorage.getItem("usuario");
  const selectPaciente = document.getElementById("idPaciente");

  if (rol === "PACIENTE" && usuarioGuardado) {
    const paciente = JSON.parse(usuarioGuardado);
    
    // Tomamos el ID (por si viene como idPaciente o id)
    const id = paciente.idPaciente || paciente.id;

    // Seteamos únicamente al paciente actual
    selectPaciente.innerHTML = `<option value="${id}" selected>${paciente.nombre} ${paciente.apellido}</option>`;
    selectPaciente.disabled = true; // Deshabilitado para que no lo modifique
  } else {
    // Si entra un ADMIN, cargamos la lista desplegable completa
    cargarTodosLosPacientes();
  }
}

async function cargarTodosLosPacientes() {
  try {
    const respuesta = await fetch("/api/pacientes");
    const pacientes = await respuesta.json();
    const select = document.getElementById("idPaciente");

    select.innerHTML = '<option value="">-- Seleccionar Paciente --</option>';
    pacientes.forEach(p => {
      select.innerHTML += `<option value="${p.idPaciente}">${p.nombre} ${p.apellido} (DNI: ${p.dni})</option>`;
    });
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
  }
}

// 4. Reservar Turno
async function reservarTurno() {
  const idPaciente = document.getElementById("idPaciente").value;
  const matriculaMedico = document.getElementById("matriculaMedico").value;
  const fechaAtencion = document.getElementById("fechaAtencion").value;
  const horaAtencion = document.getElementById("horaAtencion").value;

  if (!idPaciente || !matriculaMedico || !fechaAtencion || !horaAtencion) {
    alert("Por favor complete todos los campos obligatorios");
    return;
  }

  try {
    const respuesta = await fetch("/api/atenciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idPaciente: Number(idPaciente),
        matriculaMedico: Number(matriculaMedico),
        fechaAtencion,
        horaAtencion
      })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.message || "Error al registrar el turno");
      return;
    }

    alert("¡Turno reservado con éxito!");
    location.href = "menu.html";
  } catch (error) {
    console.error("Error en la reserva:", error);
    alert("Ocurrió un error en el servidor");
  }
}