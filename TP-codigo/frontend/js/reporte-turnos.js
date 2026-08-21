let turnosCargados = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarComboMedicos();
  filtrarTurnos(); // Carga inicial sin filtros
});

async function cargarComboMedicos() {
  try {
    const res = await fetch("/api/medicos");
    const medicos = await res.json();
    const select = document.getElementById("filtroMedico");

    medicos.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.matricula;
      opt.textContent = `Dr/a. ${m.nombre} ${m.apellido}`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Error al cargar médicos:", err);
  }
}

async function filtrarTurnos() {
  const fecha = document.getElementById("filtroFecha").value;
  const matricula = document.getElementById("filtroMedico").value;

  let query = "/api/atenciones/buscar?";
  if (fecha) query += `fecha=${fecha}&`;
  if (matricula) query += `matricula=${matricula}&`;

  try {
    const res = await fetch(query);
    turnosCargados = await res.json();
    mostrarTabla(turnosCargados);
  } catch (err) {
    console.error("Error al filtrar turnos:", err);
  }
}

function mostrarTabla(turnos) {
  const tbody = document.getElementById("tablaTurnos");
  tbody.innerHTML = "";

  if (turnos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No se encontraron turnos con los filtros seleccionados.</td></tr>`;
    return;
  }

  turnos.forEach(t => {
    const fechaStr = t.fechaAtencion.split('T')[0];
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${fechaStr}</td>
      <td>${t.horaAtencion} hs</td>
      <td>Dr/a. ${t.medico ? t.medico.nombre + ' ' + t.medico.apellido : 'N/A'}</td>
      <td>${t.paciente ? t.paciente.nombre + ' ' + t.paciente.apellido : 'N/A'}</td>
      <td><strong>${t.estado.toUpperCase()}</strong></td>
      <td><button onclick="verDetalle(${t.idAtencion})">Ver Detalle</button></td>
    `;
    tbody.appendChild(fila);
  });
}

function verDetalle(idAtencion) {
  const turno = turnosCargados.find(t => t.idAtencion === idAtencion);
  if (!turno) return;

  const fechaStr = turno.fechaAtencion.split('T')[0];
  const contenedor = document.getElementById("contenidoDetalle");

  contenedor.innerHTML = `
    <p><strong>Nro Ingreso / Atención:</strong> ${turno.idAtencion}</p>
    <p><strong>Fecha y Hora:</strong> ${fechaStr} a las ${turno.horaAtencion} hs</p>
    <p><strong>Estado Actual:</strong> <span style="text-transform: uppercase;">${turno.estado}</span></p>
    <hr>
    <h4>Información del Paciente</h4>
    <p><strong>Nombre:</strong> ${turno.paciente?.nombre} ${turno.paciente?.apellido}</p>
    <p><strong>DNI:</strong> ${turno.paciente?.dni || 'N/A'}</p>
    <p><strong>Teléfono/Email:</strong> ${turno.paciente?.email || 'N/A'}</p>
    <hr>
    <h4>Información del Médico</h4>
    <p><strong>Médico:</strong> Dr/a. ${turno.medico?.nombre} ${turno.medico?.apellido}</p>
    <p><strong>Matrícula:</strong> ${turno.medico?.matricula}</p>
    <p><strong>Especialidad:</strong> ${turno.medico?.especialidad?.nombre || 'General'}</p>
  `;

  document.getElementById("modalDetalle").style.display = "block";
}

function cerrarModal() {
  document.getElementById("modalDetalle").style.display = "none";
}

function limpiarFiltros() {
  document.getElementById("filtroFecha").value = "";
  document.getElementById("filtroMedico").value = "";
  filtrarTurnos();
}