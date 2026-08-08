document.addEventListener("DOMContentLoaded", () => {
  inicializarPantalla();
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
    const res = await fetch("/api/medicos"); // Tu endpoint para listar médicos
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

async function cargarAgenda(matricula) {
  try {
    const res = await fetch(`/api/atenciones/medico/${matricula}`);
    const turnos = await res.json();

    const tbody = document.getElementById("tablaAgenda");
    tbody.innerHTML = "";

    if (turnos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No hay turnos registrados para este médico.</td></tr>`;
      return;
    }

    turnos.forEach(t => {
      const fechaStr = t.fechaAtencion.split('T')[0];
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${fechaStr}</td>
        <td>${t.horaAtencion} hs</td>
        <td>${t.paciente ? t.paciente.nombre + ' ' + t.paciente.apellido : 'N/A'}</td>
        <td>${t.paciente?.dni || 'N/A'}</td>
        <td><strong>${t.estado.toUpperCase()}</strong></td>
        <td>
          ${
            t.estado === 'pendiente' 
              ? `
                <button onclick="cambiarEstado(${t.idAtencion}, 'atendido')" style="color:green;">Marcar Atendido</button>
                <button onclick="cambiarEstado(${t.idAtencion}, 'ausente')" style="color:orange;">Marcar Ausente</button>
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