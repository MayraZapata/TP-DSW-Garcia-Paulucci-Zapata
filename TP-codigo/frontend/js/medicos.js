async function cargarEspecialidades() {
  try {
    const respuesta = await fetch("/api/especialidades");
    const especialidades = await respuesta.json();
    const select = document.getElementById("idEspecialidad");

    // Limpiamos el select antes de cargar para evitar duplicados
    select.innerHTML = '<option value="">-- Seleccionar Especialidad --</option>';

    // Set para evitar agregar nombres repetidos
    const nombresVistos = new Set();

    especialidades.forEach(esp => {
      const nombre = esp.nombreEspecialidad || esp.nombre || '';
      const nombreLimpio = nombre.trim().toLowerCase();

      if (nombreLimpio && !nombresVistos.has(nombreLimpio)) {
        nombresVistos.add(nombreLimpio);

        const option = document.createElement("option");
        option.value = esp.idEspecialidad;
        option.textContent = nombre;
        select.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error al cargar especialidades:", error);
  }
}

async function crearMedico() {
  const matricula = document.getElementById("matricula").value;
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const nombreUsuario = document.getElementById("nombreUsuario").value;
  const password = document.getElementById("password").value;
  const idEspecialidad = document.getElementById("idEspecialidad").value;

  const respuesta = await fetch("/api/medicos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      matricula,
      nombre,
      apellido,
      nombreUsuario,
      password,
      idEspecialidad
    })
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    alert(datos.message || "Error al crear médico");
    return;
  }

  alert("Médico registrado correctamente");
  cargarMedicos();
}

async function eliminarMedico(matricula) {
  if (!confirm("¿Estás seguro de eliminar este médico?")) return;

  await fetch(`/api/medicos/${matricula}`, { method: "DELETE" });
  cargarMedicos();
}

async function editarMedico(matricula) {
  const nombre = prompt("Nuevo nombre");
  const apellido = prompt("Nuevo apellido");
  const password = prompt("Nueva contraseña");
  const idEspecialidad = prompt("Nuevo ID de Especialidad");

  if (!nombre || !apellido) return;

  await fetch(`/api/medicos/${matricula}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre,
      apellido,
      password,
      idEspecialidad
    })
  });

  cargarMedicos();
}

async function cargarMedicos() {
  try {
    const respuesta = await fetch("/api/medicos");
    const medicos = await respuesta.json();
    const lista = document.getElementById("listaMedicos");

    lista.innerHTML = "";

    medicos.forEach(medico => {
      lista.innerHTML += `
        <li>
          <strong>Matrícula:</strong> ${medico.matricula}<br>
          <strong>Nombre:</strong> ${medico.nombre} ${medico.apellido}<br>
          <strong>Usuario:</strong> ${medico.nombreUsuario}<br>
          <strong>Especialidad:</strong> ${medico.especialidad?.nombreEspecialidad || medico.especialidad?.nombre || "Sin Asignar"}
          <br><br>
          <button onclick="eliminarMedico(${medico.matricula})">Eliminar</button>
          <button onclick="editarMedico(${medico.matricula})">Editar</button>
        </li>
        <hr>
      `;
    });
  } catch (error) {
    console.error("Error al cargar médicos:", error);
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarEspecialidades();
  cargarMedicos();
});