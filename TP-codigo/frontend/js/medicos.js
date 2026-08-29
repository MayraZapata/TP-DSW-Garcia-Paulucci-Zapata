let medicoEditando = null;
let medicosCargados = [];

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


async function guardarMedico() {

    const matricula = document.getElementById("matricula").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const nombreUsuario = document.getElementById("nombreUsuario").value;
    const password = document.getElementById("password").value;
    const idEspecialidad = document.getElementById("idEspecialidad").value;

    // Si hay un médico en edición, hacemos PUT
    if (medicoEditando !== null) {

        const respuesta = await fetch(`/api/medicos/${medicoEditando}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre,
                apellido,
                nombreUsuario,
                password,
                idEspecialidad
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.message || "Error al editar médico");
            return;
        }

        alert("Médico actualizado correctamente");

        cancelarEdicion();
        cargarMedicos();

        return;
    }

    // Si no estamos editando, hacemos POST para crear
    const respuesta = await fetch("/api/medicos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
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

    limpiarFormulario();
    cargarMedicos();
}

function editarMedico(matricula) {

    const medico = medicosCargados.find(
        medico => medico.matricula == matricula
    );

    if (!medico) {
        alert("No se encontró el médico");
        return;
    }

    medicoEditando = matricula;

    document.getElementById("matricula").value = medico.matricula;
    document.getElementById("nombre").value = medico.nombre || "";
    document.getElementById("apellido").value = medico.apellido || "";
    document.getElementById("nombreUsuario").value = medico.nombreUsuario || "";

    // Por seguridad, no mostramos la contraseña actual
    document.getElementById("password").value = "";

    document.getElementById("idEspecialidad").value =
        medico.idEspecialidad || "";

    // La matrícula identifica al médico, por lo que no la modificamos
    document.getElementById("matricula").disabled = true;

    // Cambiamos el texto del botón
    document.getElementById("botonGuardar").textContent =
        "Guardar cambios";

    // Mostramos cancelar
    document.getElementById("botonCancelar").style.display =
        "inline-block";
}

function cancelarEdicion() {

    medicoEditando = null;

    limpiarFormulario();

    document.getElementById("matricula").disabled = false;

    document.getElementById("botonGuardar").textContent =
        "Guardar Médico";

    document.getElementById("botonCancelar").style.display =
        "none";
}

function limpiarFormulario() {

    document.getElementById("matricula").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("apellido").value = "";
    document.getElementById("nombreUsuario").value = "";
    document.getElementById("password").value = "";
    document.getElementById("idEspecialidad").value = "";
}



async function eliminarMedico(matricula) {
  if (!confirm("¿Estás seguro de eliminar este médico?")) return;

  await fetch(`/api/medicos/${matricula}`, { method: "DELETE" });
  cargarMedicos();
}

async function cargarMedicos() {
  try {
    const respuesta = await fetch("/api/medicos");
    const medicos = await respuesta.json();
    medicosCargados = medicos; // Guardamos los médicos cargados para futuras ediciones
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