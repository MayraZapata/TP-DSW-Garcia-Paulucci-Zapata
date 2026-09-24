document.addEventListener("DOMContentLoaded", () => {
  inicializarPantalla();
  cargarComboDiagnosticos();

  // Manejar el submit del formulario de diagnóstico
  const formDiagnostico = document.getElementById("formDiagnostico");
  if (formDiagnostico) {
    formDiagnostico.addEventListener("submit", guardarDiagnostico);
  }
});

async function inicializarPantalla() {
  const rol = localStorage.getItem("rol");
  const usuarioGuardado = localStorage.getItem("usuario");
  const selectMedico = document.getElementById("selectMedico");

  if (!usuarioGuardado) {
    location.href = "login.html";
    return;
  }

  const usuario = JSON.parse(usuarioGuardado);

  if (rol === "MEDICO") {
    // Si es médico, fijamos y bloqueamos el combo
    selectMedico.innerHTML = `<option value="${usuario.matricula}">Dr/a. ${usuario.nombre} ${usuario.apellido}</option>`;
    selectMedico.disabled = true;
    cargarAgenda(usuario.matricula);

  } else if (rol === "ADMIN") {
    // Si es Admin, cargamos todos los médicos disponibles
    await cargarComboMedicos();
    selectMedico.addEventListener("change", (e) => {
      if (e.target.value) cargarAgenda(e.target.value);
    });
  }
}

async function cargarComboMedicos() {
  try {
    const res = await fetch("/api/medicos");
    const medicos = await res.json();
    const selectMedico = document.getElementById("selectMedico");

    medicos.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.matricula;
      opt.textContent = `Dr/a. ${m.nombre} ${m.apellido}`;
      selectMedico.appendChild(opt);
    });
  } catch (error) {
    console.error("Error al cargar médicos:", error);
  }
}

// Cargar la lista de diagnósticos en el desplegable del Modal
async function cargarComboDiagnosticos() {
  try {
    const res = await fetch("/api/diagnosticos"); 
    
    if (!res.ok) {
      console.error(`Error HTTP ${res.status} al obtener diagnósticos`);
      return;
    }

    const diagnosticos = await res.json();
    const selectDiagnostico = document.getElementById("selectDiagnostico");

    if (!selectDiagnostico) return;

    selectDiagnostico.innerHTML = '<option value="">-- Seleccione un Diagnóstico --</option>';
    
    // Si la respuesta viene envuelta en un objeto tipo { data: [...] }, se contempla:
    const lista = Array.isArray(diagnosticos) ? diagnosticos : (diagnosticos.data || []);

    lista.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.idDiagnostico || d.id; 
      opt.textContent = d.nombreDiagnostico || d.nombre || d.descripcion;
      selectDiagnostico.appendChild(opt);
    });
  } catch (error) {
    console.error("Error al cargar diagnósticos:", error);
  }
}

async function cargarAgenda(matricula) {
  try {
    const res = await fetch(`/api/atenciones/medico/${matricula}`);
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Error del servidor:", errData);
      const tbody = document.getElementById("tablaAgenda");
      tbody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Error al cargar los turnos del médico (Status ${res.status}). Checkear consola del backend.</td></tr>`;
      return;
    }

    const turnos = await res.json();

    // Validar que realmente sea un array
    if (!Array.isArray(turnos)) {
      console.error("Se esperaba un arreglo de turnos pero se recibió:", turnos);
      return;
    }

    const tbody = document.getElementById("tablaAgenda");
    tbody.innerHTML = "";

    if (turnos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No hay turnos registrados para este médico.</td></tr>`;
      return;
    }

    turnos.forEach(t => {
      const fechaStr = t.fechaAtencion ? t.fechaAtencion.split('T')[0] : 'N/A';
      const idAtencionReal = t.idAtencion || t.id;

      const fila = document.createElement("tr");

      const diagnosticoTexto = t.diagnostico 
        ? (t.diagnostico.nombreDiagnostico || t.diagnostico.nombre || t.diagnostico.descripcion) 
        : '<em style="color:gray;">Sin diagnóstico</em>';

      fila.innerHTML = `
        <td>${fechaStr}</td>
        <td>${t.horaAtencion} hs</td>
        <td>${t.paciente ? t.paciente.nombre + ' ' + t.paciente.apellido : 'N/A'}</td>
        <td>${t.paciente?.dni || 'N/A'}</td>
        <td><strong>${t.estado ? t.estado.toUpperCase() : 'PENDIENTE'}</strong></td>
        <td>${diagnosticoTexto}</td>
        <td>
          ${
            t.estado === 'pendiente' 
              ? `
                <button onclick="abrirModalDiagnostico(${idAtencionReal})" style="color:green;">Marcar Atendido</button>
                <button onclick="cambiarEstado(${idAtencionReal}, 'ausente')" style="color:orange;">Marcar Ausente</button>
                `
              : t.estado === 'atendido'
              ? `
                <button onclick="abrirModalDiagnostico(${idAtencionReal})" style="color:blue;">Editar Diagnóstico</button>
                `
              : `<span style="color:gray;">Finalizado</span>`
          }
        </td>
      `;
      tbody.appendChild(fila);
    });

  } catch (error) {
    console.error("Error al cargar la agenda:", error);
  }
}

// Funciones para manejar el Modal
function abrirModalDiagnostico(idAtencion) {
  document.getElementById("modalIdAtencion").value = idAtencion;
  document.getElementById("selectDiagnostico").value = "";
  document.getElementById("modalDiagnostico").style.display = "block";
}

function cerrarModalDiagnostico() {
  document.getElementById("modalDiagnostico").style.display = "none";
}

// Guardar Diagnóstico y cambiar estado a "atendido"
async function guardarDiagnostico(e) {
  e.preventDefault();

  const idAtencion = document.getElementById("modalIdAtencion").value;
  const idDiagnostico = document.getElementById("selectDiagnostico").value;

  if (!idAtencion || idAtencion === "undefined") {
    alert("Error: No se encontró el ID de la atención.");
    return;
  }

  if (!idDiagnostico) {
    alert("Por favor seleccione un diagnóstico.");
    return;
  }

  try {
    const res = await fetch(`/api/atenciones/${idAtencion}/diagnostico`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        idDiagnostico: Number(idDiagnostico),
        estado: "atendido"
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || "Atención y diagnóstico guardados con éxito.");
      cerrarModalDiagnostico();
      const selectMedico = document.getElementById("selectMedico");
      cargarAgenda(selectMedico.value); // Recargar la tabla
    } else {
      alert("Error: " + (data.message || "No se pudo guardar"));
    }
  } catch (error) {
    console.error("Error al guardar diagnóstico:", error);
    alert("Error al conectar con el servidor.");
  }
}

async function cambiarEstado(idAtencion, nuevoEstado) {
  try {
    const res = await fetch(`/api/atenciones/${idAtencion}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Estado del turno actualizado a: ${nuevoEstado}`);
      const selectMedico = document.getElementById("selectMedico");
      cargarAgenda(selectMedico.value); // Recargar la tabla
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error al cambiar estado:", error);
  }
}