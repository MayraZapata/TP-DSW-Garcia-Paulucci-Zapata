let pacienteEditando = null;
let pacientesCargados = [];
const parametros = new URLSearchParams(window.location.search);
const esRegistro = parametros.get("origen") === "login";



function obtenerUsuarioLogueado() {
  try {
    return JSON.parse(localStorage.getItem("usuario")) || {};
  } catch (e) {
    return {};
  }
}

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


async function guardarPaciente() {
  const nombre = document.getElementById("nombre").value;
  const apellido = document.getElementById("apellido").value;
  const dni = document.getElementById("dni").value;
  const nombreUsuario = document.getElementById("nombreUsuario").value;
  const password = document.getElementById("password").value;
  const idObraVal = document.getElementById("idObra").value;


  // ==========================================
  // MODO EDICIÓN
  if (pacienteEditando !== null) {
      const datosActualizar = {
          nombre,
          apellido,
          dni,
          nombreUsuario,
          idObra: idObraVal === "" ? null : Number(idObraVal)
      };
      // Solo enviamos una nueva contraseña si el usuario escribió una
      if (password !== "") {
          datosActualizar.password = password;
      }
      const respuesta = await fetch(
          `/api/pacientes/${pacienteEditando}`,
          {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify(datosActualizar)
          }
      );
      const datos = await respuesta.json();
      if (!respuesta.ok) {
          alert(datos.message || "Error al editar paciente");
          return;
      }
      alert("Paciente actualizado correctamente");
      cancelarEdicion();
      cargarPacientes();
      return;
  }
  // ==========================================
  // MODO CREACIÓN
  const respuesta = await fetch("/api/pacientes", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
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
  const rol = localStorage.getItem("rol");
  if (rol !== "ADMIN") {
      volver();
      return;
  }
  limpiarFormulario();
  cargarPacientes();
}


function editarPaciente(id) {
  const paciente = pacientesCargados.find(paciente => paciente.idPaciente == id);

  if (!paciente) {
      alert("No se encontró el paciente");
      return;
  }

  // Guardamos qué paciente estamos editando
  pacienteEditando = id;
  // Autocompletamos el formulario
  document.getElementById("nombre").value = paciente.nombre || "";
  document.getElementById("apellido").value = paciente.apellido || "";
  document.getElementById("dni").value = paciente.dni || "";
  document.getElementById("nombreUsuario").value = paciente.nombreUsuario || "";
  // Por seguridad, NO mostramos la contraseña actual
  document.getElementById("password").value = "";
  // Seleccionamos automáticamente la obra social
  document.getElementById("idObra").value = paciente.obraSocial?.idObra || "";
  // Cambiamos el botón principal
  document.getElementById("botonGuardar").textContent = "Guardar cambios";
  // Mostramos el botón cancelar
  document.getElementById("botonCancelar").style.display = "inline-block";
}



async function eliminarPaciente(id) {
  if (!confirm("¿Estás seguro de eliminar este paciente?")) return;

  await fetch(`/api/pacientes/${id}`, { method: "DELETE" });
  cargarPacientes();
}


function cancelarEdicion() {
  pacienteEditando = null;
  limpiarFormulario();
  document.getElementById("botonGuardar").textContent = "Guardar Paciente";
  document.getElementById("botonCancelar").style.display = "none";
}

function limpiarFormulario() {
  document.getElementById("nombre").value = "";
  document.getElementById("apellido").value = "";
  document.getElementById("dni").value = "";
  document.getElementById("nombreUsuario").value = "";
  document.getElementById("password").value = "";
  document.getElementById("idObra").value = "";
}



async function cargarPacientes() {
  const rol = localStorage.getItem("rol");
  if (esRegistro) {
    return;
  }
  // PACIENTE LOGUEADO
  // ==========================================
  if (rol === "PACIENTE") {
      const usuario = obtenerUsuarioLogueado();
      const idPaciente = usuario.idPaciente;
      if (!idPaciente) {
          console.error("No se encontró el idPaciente del usuario logueado");
          return;
      }

      try {
          const respuesta = await fetch(`/api/pacientes/${idPaciente}`);
          const paciente = await respuesta.json();
          if (!respuesta.ok) {
              alert(paciente.message || "No se pudieron cargar los datos del paciente");
              return;
          }
          // Guardamos el paciente para mantener
          // el mismo funcionamiento del formulario
          pacientesCargados = [paciente];
          // Entramos directamente en modo edición
          pacienteEditando = paciente.idPaciente;
          // Autocompletamos el formulario
          document.getElementById("nombre").value =
              paciente.nombre || "";
          document.getElementById("apellido").value =
              paciente.apellido || "";
          document.getElementById("dni").value =
              paciente.dni || "";
          document.getElementById("nombreUsuario").value =
              paciente.nombreUsuario || "";
          // Nunca mostramos la contraseña actual
          document.getElementById("password").value = "";
          // Seleccionamos su obra social
          document.getElementById("idObra").value =
              paciente.obraSocial?.idObra || "";
         // Cambiamos el botón
          document.getElementById("botonGuardar").textContent =
              "Guardar cambios";
          // El paciente ya está en modo edición,
          // por lo que no necesita "Cancelar edición"
          document.getElementById("botonCancelar").style.display =
              "none";
      } catch (error) {
          console.error(
              "Error al cargar los datos del paciente:",
              error
          );
      }
      return;
  }


  // ADMINISTRADOR
  // ==========================================

  if (rol !== "ADMIN") {
      return;
  }
  try {
      const respuesta = await fetch("/api/pacientes");
      const pacientes = await respuesta.json();
      // Guardamos los pacientes para poder editarlos
      pacientesCargados = pacientes;
      const lista = document.getElementById("listaPacientes");
      lista.innerHTML = `
        <hr>
        <h2>Pacientes registrados</h2>
      `;
      pacientes.forEach(paciente => {
          lista.innerHTML += `
              <li>
                  <strong>ID:</strong>
                  ${paciente.idPaciente}
                  <br>
                  <strong>Nombre:</strong>
                  ${paciente.nombre} ${paciente.apellido}
                  <br>
                  <strong>DNI:</strong>
                  ${paciente.dni || "N/A"}
                  <br>
                  <strong>Usuario:</strong>
                  ${paciente.nombreUsuario}
                  <br>
                  <strong>Obra Social:</strong>
                  ${
                      paciente.obraSocial?.nombreObra ??
                      "Sin obra social"
                  }
                  <br><br>
                  <button onclick="eliminarPaciente(${paciente.idPaciente})">
                      Eliminar
                  </button>
                  <button onclick="editarPaciente(${paciente.idPaciente})">
                      Editar
                  </button>
              </li>
              <hr>
          `;
      });
  } catch (error) {
    console.error("Error al cargar pacientes:", error);
  }
}



async function volver() {

  const parametros = new URLSearchParams(window.location.search);
  const esRegistro = parametros.get("origen") === "login";

  if (esRegistro) {
    localStorage.removeItem("titulo");
    location.href = "login.html";
    return;
  }
  const rol = localStorage.getItem("rol");
  localStorage.removeItem("titulo");
  if (rol !== "ADMIN" && rol !== "PACIENTE") {
    localStorage.removeItem("titulo");
    location.href = "login.html";
  } else {
    localStorage.removeItem("titulo");
    location.href = "menu.html";
  }
}

// Carga inicial al estar listo el documento
document.addEventListener("DOMContentLoaded", () => {
  const titulo = document.getElementById("titulo");
  const rol = localStorage.getItem("rol");
  if (esRegistro) {
    titulo.textContent = "Registrar Usuario";
  } else if (rol === "ADMIN") {
    titulo.textContent = "CRUD Pacientes";
  } else if (rol === "PACIENTE") {
    titulo.textContent = "Editar Datos Personales";
  }
  cargarObrasSociales();
    cargarPacientes();
});


