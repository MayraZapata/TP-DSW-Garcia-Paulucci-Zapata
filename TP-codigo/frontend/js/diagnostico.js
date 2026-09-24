let diagnosticoEditando = null;
let diagnosticosCargados = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarDiagnosticos();

  const buscador = document.getElementById("buscadorDiagnostico");
  if (buscador) {
    buscador.addEventListener("input", filtrarDiagnosticos);
  }
});

async function cargarDiagnosticos() {
  try {
    const respuesta = await fetch("/api/diagnosticos");
    if (!respuesta.ok) {
      console.error("Error en la respuesta del servidor:", respuesta.status);
      return;
    }
    diagnosticosCargados = await respuesta.json();
    filtrarDiagnosticos();
  } catch (error) {
    console.error("Error al cargar diagnósticos:", error);
  }
}

function renderDiagnosticos(diagnosticos) {
  const lista = document.getElementById("listaDiagnosticos");
  if (!lista) return;

  lista.innerHTML = "";

  if (diagnosticos.length === 0) {
    lista.innerHTML = "<li>No se encontraron diagnósticos.</li>";
    return;
  }

  diagnosticos.forEach(diagnostico => {
    lista.innerHTML += `
      <li>
        <strong>ID:</strong> ${diagnostico.idDiagnostico} <br>
        <strong>Nombre:</strong> ${diagnostico.nombreDiagnostico} <br>
        <strong>Tratamiento:</strong> ${diagnostico.tratamiento ?? "—"} <br><br>
        <button onclick="editarDiagnostico(${diagnostico.idDiagnostico})">Editar</button>
        <button onclick="eliminarDiagnostico(${diagnostico.idDiagnostico})">Eliminar</button>
      </li>
      <hr>
    `;
  });
}

function filtrarDiagnosticos() {
  const buscador = document.getElementById("buscadorDiagnostico");
  const termino = buscador ? buscador.value.trim().toLowerCase() : "";

  const filtrados = !termino
    ? diagnosticosCargados
    : diagnosticosCargados.filter(d =>
        d.nombreDiagnostico?.toLowerCase().includes(termino) ||
        d.tratamiento?.toLowerCase().includes(termino)
      );

  renderDiagnosticos(filtrados);
}

async function guardarDiagnostico() {
  const nombreDiagnostico = document.getElementById("nombreDiagnostico").value.trim();
  const tratamiento = document.getElementById("tratamiento").value.trim();

  if (!nombreDiagnostico) {
    alert("El nombre del diagnóstico es obligatorio.");
    return;
  }

  if (diagnosticoEditando !== null) {
    const respuesta = await fetch(`/api/diagnosticos/${diagnosticoEditando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreDiagnostico, tratamiento: tratamiento || null })
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert(datos.message || "Error al editar diagnóstico");
      return;
    }
    alert("Diagnóstico actualizado correctamente");
    cancelarEdicion();
    cargarDiagnosticos();
    return;
  }

  const respuesta = await fetch("/api/diagnosticos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombreDiagnostico, tratamiento: tratamiento || null })
  });
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    alert(datos.message || "Error al crear diagnóstico");
    return;
  }
  alert("Diagnóstico registrado correctamente");
  limpiarFormulario();
  cargarDiagnosticos();
}

async function eliminarDiagnostico(id) {
  if (!confirm("¿Estás seguro de eliminar este diagnóstico?")) return;

  const respuesta = await fetch(`/api/diagnosticos/${id}`, {
    method: "DELETE"
  });

  if (!respuesta.ok) {
    const datos = await respuesta.json();
    alert(datos.message || "Error al eliminar diagnóstico");
    return;
  }
  cargarDiagnosticos();
}

function editarDiagnostico(id) {
  const diagnostico = diagnosticosCargados.find(d => d.idDiagnostico == id);
  if (!diagnostico) {
    alert("No se encontró el diagnóstico");
    return;
  }
  diagnosticoEditando = id;
  document.getElementById("nombreDiagnostico").value = diagnostico.nombreDiagnostico || "";
  document.getElementById("tratamiento").value = diagnostico.tratamiento ?? "";
  
  const btnGuardar = document.getElementById("botonGuardar");
  if (btnGuardar) btnGuardar.textContent = "Guardar cambios";
  
  const btnCancelar = document.getElementById("botonCancelar");
  if (btnCancelar) btnCancelar.style.display = "inline-block";
}

function cancelarEdicion() {
  diagnosticoEditando = null;
  limpiarFormulario();
  const btnGuardar = document.getElementById("botonGuardar");
  if (btnGuardar) btnGuardar.textContent = "Guardar Diagnóstico";
  
  const btnCancelar = document.getElementById("botonCancelar");
  if (btnCancelar) btnCancelar.style.display = "none";
}

function limpiarFormulario() {
  document.getElementById("nombreDiagnostico").value = "";
  document.getElementById("tratamiento").value = "";
}