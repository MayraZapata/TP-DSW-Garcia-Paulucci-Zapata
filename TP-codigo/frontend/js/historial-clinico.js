let atencionesCargadas = [];

// Usamos window.onload para garantizarnos de que el HTML cargó 100% en memoria
window.onload = async function() {
  console.log("--> Iniciando script de Historial Clínico...");

  const rolGuardado = localStorage.getItem("rol") || "";
  const rol = rolGuardado.toUpperCase().trim();
  const usuarioGuardado = localStorage.getItem("usuario");

  console.log("Rol detectado:", rol);
  console.log("Usuario guardado:", usuarioGuardado);

  if (!rol || !usuarioGuardado) {
    alert("Sesión no válida");
    location.href = "login.html";
    return;
  }

  const usuario = JSON.parse(usuarioGuardado);

  const inputDni = document.getElementById("inputDni");
  const btnBuscar = document.getElementById("btnBuscarDni");
  const infoPaciente = document.getElementById("infoPaciente");

  if (rol === "PACIENTE") {
    console.log("Configurando vista para PACIENTE...");

    if (inputDni) {
      inputDni.value = usuario.dni || "";
      inputDni.disabled = true; // Bloquea totalmente la edición del input
    }
    
    if (btnBuscar) {
      btnBuscar.style.display = "none"; // Oculta el botón Buscar
    }

    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`;
    if (infoPaciente) {
      infoPaciente.innerText = `Paciente: ${nombreCompleto} (DNI: ${usuario.dni || 'N/A'})`;
    }

    // Usamos el ID del paciente guardado en el usuario de LocalStorage
    const idPaciente = usuario.idPaciente || usuario.id;
    console.log("Consultando historial para el idPaciente:", idPaciente);
    await cargarHistorialPorId(idPaciente);

  } else {
    console.log("Configurando vista para MEDICO / ADMIN...");
    if (inputDni) inputDni.disabled = false;
    if (btnBuscar) btnBuscar.style.display = "inline-block";
    if (infoPaciente) infoPaciente.innerText = "Ingrese el DNI de un paciente y presione Buscar.";
    
    document.getElementById("tablaHistorial").innerHTML = 
      `<tr><td colspan="6" style="text-align:center;">Ingrese un DNI de paciente para consultar.</td></tr>`;
  }
};

// Carga el historial directamente consultando al Backend
async function cargarHistorialPorId(idPaciente) {
  try {
    console.log(`Realizando fetch a /api/atenciones/paciente/${idPaciente}`);
    const response = await fetch(`/api/atenciones/paciente/${idPaciente}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const atenciones = await response.json();
    console.log("Atenciones recibidas del backend:", atenciones);
    renderizarTabla(atenciones);
  } catch (error) {
    console.error("Error al cargar el historial por ID:", error);
    document.getElementById("tablaHistorial").innerHTML = 
      `<tr><td colspan="6" style="color:red; text-align:center;">Error al consultar las atenciones en el servidor.</td></tr>`;
  }
}

// Búsqueda por DNI para Médico/Admin
async function buscarPorDni() {
  const dniInput = document.getElementById("inputDni").value.trim();
  if (!dniInput) {
    alert("Por favor, ingrese un DNI.");
    return;
  }

  try {
    console.log("Buscando atenciones para DNI:", dniInput);
    const resAtenciones = await fetch(`/api/atenciones`);
    if (!resAtenciones.ok) throw new Error("Error al obtener atenciones");

    const todasAtenciones = await resAtenciones.json();

    const atencionesDelPaciente = todasAtenciones.filter(
      a => a.paciente && String(a.paciente.dni) === String(dniInput)
    );

    if (atencionesDelPaciente.length === 0) {
      document.getElementById("infoPaciente").innerText = `No se encontraron atenciones para el DNI: ${dniInput}`;
      document.getElementById("tablaHistorial").innerHTML = 
        `<tr><td colspan="6" style="text-align:center;">Sin atenciones registradas.</td></tr>`;
      return;
    }

    const p = atencionesDelPaciente[0].paciente;
    document.getElementById("infoPaciente").innerText = `Historial de: ${p.nombre} ${p.apellido} (DNI: ${p.dni})`;

    renderizarTabla(atencionesDelPaciente);

  } catch (error) {
    console.error("Error al buscar historial por DNI:", error);
    alert("Ocurrió un error al consultar el historial por DNI.");
  }
}

// Renderizado de filas en la tabla
function renderizarTabla(atenciones) {
  atencionesCargadas = atenciones;
  const tbody = document.getElementById("tablaHistorial");
  tbody.innerHTML = "";

  if (!atenciones || atenciones.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">El paciente no posee atenciones registradas.</td></tr>`;
    return;
  }

  atenciones.forEach((atencion) => {
    const fechaStr = atencion.fechaAtencion ? atencion.fechaAtencion.split("T")[0] : "N/A";
    const medicoNombre = atencion.medico 
      ? `Dr/a. ${atencion.medico.nombre} ${atencion.medico.apellido}` 
      : "N/A";
    
    const especialidad = 
      atencion.medico?.especialidad?.nombreEspecialidad || 
      atencion.medico?.especialidad?.nombre || 
      "General";

    const estadoTexto = atencion.estado ? atencion.estado.toUpperCase() : "DESCONOCIDO";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${fechaStr}</td>
      <td>${atencion.horaAtencion || ''} hs</td>
      <td>${medicoNombre}</td>
      <td>${especialidad}</td>
      <td><strong>${estadoTexto}</strong></td>
      <td>
        ${
          atencion.estado === "atendido" && atencion.diagnostico
            ? `<button onclick="verDetalleDiagnostico(${atencion.idAtencion})">Ver Diagnóstico</button>`
            : `<span style="color:gray;">Sin detalle</span>`
        }
      </td>
    `;
    tbody.appendChild(fila);
  });
}

function verDetalleDiagnostico(idAtencion) {
  const atencion = atencionesCargadas.find((a) => a.idAtencion === idAtencion);
  if (!atencion || !atencion.diagnostico) return;

  const diag = atencion.diagnostico;
  const fechaStr = atencion.fechaAtencion ? atencion.fechaAtencion.split("T")[0] : "N/A";

  document.getElementById("diagFecha").innerText = fechaStr;
  document.getElementById("diagMedico").innerText = atencion.medico 
    ? `Dr/a. ${atencion.medico.nombre} ${atencion.medico.apellido}` 
    : "N/A";

  document.getElementById("diagNombre").innerText = 
    diag.nombreDiagnostico || diag.nombre || "Sin especificar";

  document.getElementById("diagTratamiento").innerText = 
    diag.tratamiento || diag.descripcion || "Sin indicaciones adicionales.";

  document.getElementById("modalDiagnostico").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalDiagnostico").style.display = "none";
}