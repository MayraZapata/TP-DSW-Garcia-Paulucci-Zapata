async function cargarObrasSociales() {
  try {
    const respuesta = await fetch("/api/obrasSociales");
    const obras = await respuesta.json();
    const select = document.getElementById("idObra");

    // 1. Limpiamos el select antes de insertar para evitar duplicación
    select.innerHTML = '<option value="">Sin obra social</option>';

    // 2. Set para filtrar nombres repetidos
    const nombresVistos = new Set();

    obras.forEach(obra => {
      const nombreRaw = obra.nombreObra || '';
      const nombreLimpio = nombreRaw.trim().toLowerCase();

      if (nombreLimpio && !nombresVistos.has(nombreLimpio)) {
        nombresVistos.add(nombreLimpio);

        const option = document.createElement("option");
        option.value = obra.idObra;
        option.textContent = nombreRaw;
        select.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Error al cargar obras sociales:", error);
  }
}

async function crearPaciente() {
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const dni = document.getElementById("dni").value;
  const nombreUsuario = document.getElementById("nombreUsuario").value;
  const password = document.getElementById("password").value;
  const idObraVal = document.getElementById("idObra").value;

  const respuesta = await fetch("/api/pacientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre,
      apellido,
      dni,
      nombreUsuario,
      password,
      idObra: idObraVal === "" ? null : Number(idObraVal)
    })
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    alert(datos.message || "Error al crear paciente");
    return;
  }

  alert("Paciente registrado correctamente");
  cargarPacientes();
}

async function eliminarPaciente(id) {
  if (!confirm("¿Estás seguro de eliminar este paciente?")) return;

  await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
  cargarPacientes();
}

async function editarPaciente(id) {
  const nombre = prompt("Nuevo nombre");
  const apellido = prompt("Nuevo apellido");
  const dni = prompt("Nuevo DNI");
  const password = prompt("Nueva contraseña");
  const idObra = prompt("Nuevo ID de Obra Social");

  if (!nombre || !apellido) return;

  await fetch(`/api/pacientes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre,
      apellido,
      dni,
      password,
      idObra: idObra === "" ? null : Number(idObra)
    })
  });

  cargarPacientes();
}

async function cargarPacientes() {
  try {
    const respuesta = await fetch("/api/pacientes");
    const pacientes = await respuesta.json();
    const lista = document.getElementById("listaPacientes");

    lista.innerHTML = "";

    pacientes.forEach(paciente => {
      lista.innerHTML += `
        <li>
          <strong>ID:</strong> ${paciente.idPaciente}<br>
          <strong>Nombre:</strong> ${paciente.nombre} ${paciente.apellido}<br>
          <strong>DNI:</strong> ${paciente.dni || 'N/A'}<br>
          <strong>Usuario:</strong> ${paciente.nombreUsuario}<br>
          <strong>Obra Social:</strong> ${paciente.obraSocial?.nombreObra ?? "Sin obra social"}
          <br><br>
          <button onclick="eliminarPaciente(${paciente.idPaciente})">Eliminar</button>
          <button onclick="editarPaciente(${paciente.idPaciente})">Editar</button>
        </li>
        <hr>
      `;
    });
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
  }
}

// Carga inicial al estar listo el documento
document.addEventListener("DOMContentLoaded", () => {
  cargarObrasSociales();
  cargarPacientes();
});