document.addEventListener("DOMContentLoaded", () => {
  cargarMisTurnos();
});

async function cargarMisTurnos() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) {
    alert("Sesión no válida");
    location.href = "login.html";
    return;
  }

  const usuario = JSON.parse(usuarioGuardado);
  const idPaciente = usuario.idPaciente || usuario.id;

  try {
    const response = await fetch(`/api/atenciones/paciente/${idPaciente}`);
    const turnos = await response.json();

    const tbody = document.getElementById("tablaMisTurnos");
    tbody.innerHTML = "";

    if (turnos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No tienes turnos reservados.</td></tr>`;
      return;
    }

    const ahora = new Date();

    turnos.forEach(turno => {
      // Formatear la fecha
      const fechaStr = turno.fechaAtencion.split('T')[0];
      const fechaHoraTurno = new Date(`${fechaStr}T${turno.horaAtencion}`);
      
      // El turno sólo se puede cancelar si no pasó y no está cancelado/atendido
      const yaPaso = fechaHoraTurno < ahora;
      const esCancelable = turno.estado === 'pendiente' && !yaPaso;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${fechaStr}</td>
        <td>${turno.horaAtencion} hs</td>
        <td>Dr/a. ${turno.medico ? turno.medico.nombre + ' ' + turno.medico.apellido : 'N/A'}</td>
        <td>${turno.medico?.especialidad?.nombre || 'General'}</td>
        <td><strong>${turno.estado.toUpperCase()}</strong></td>
        <td>
          ${
            esCancelable 
              ? `<button onclick="cancelarTurno(${turno.idAtencion})" style="color:red;">Cancelar</button>`
              : `<span style="color:gray;">No disponible</span>`
          }
        </td>
      `;
      tbody.appendChild(fila);
    });

  } catch (error) {
    console.error("Error al cargar los turnos:", error);
  }
}

async function cancelarTurno(idAtencion) {
  if (!confirm("¿Estás seguro de que querés cancelar este turno?")) return;

  try {
    const response = await fetch(`/api/atenciones/${idAtencion}/cancelar`, {
      method: "PATCH"
    });

    const data = await response.json();

    if (response.ok) {
      alert("Turno cancelado con éxito");
      cargarMisTurnos(); // Recargamos la tabla
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error al cancelar el turno:", error);
  }
}