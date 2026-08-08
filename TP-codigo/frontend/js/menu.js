const rol = localStorage.getItem("rol");
const tituloRol = document.getElementById("tituloRol");
const btnPacientes = document.getElementById("btnPacientes");
const btnMedicos = document.getElementById("btnMedicos");
const btnTurnos = document.getElementById("btnTurnos");
const btnMisTurnos = document.getElementById("btnMisTurnos");
const btnAgenda = document.getElementById("btnAgenda");

if (!rol) {
  location.href = "login.html";
}

if (rol === "ADMIN") {
  tituloRol.textContent = "Administrador";
  // El Admin no ve "Mis Turnos" de paciente
  if (btnMisTurnos) btnMisTurnos.style.display = "none";
} 
else if (rol === "MEDICO") {
  tituloRol.textContent = "Médico";
  if (btnPacientes) btnPacientes.style.display = "none";
  if (btnMedicos) btnMedicos.style.display = "none";
  if (btnTurnos) btnTurnos.style.display = "none";
  if (btnMisTurnos) btnMisTurnos.style.display = "none";
  // Mantiene visible sólo btnAgenda
} 
else if (rol === "PACIENTE") {
  tituloRol.textContent = "Paciente";
  if (btnPacientes) btnPacientes.style.display = "none";
  if (btnMedicos) btnMedicos.style.display = "none";
  if (btnAgenda) btnAgenda.style.display = "none";
  // Mantiene visibles btnTurnos y btnMisTurnos
}

function cerrarSesion() {
  localStorage.removeItem("rol");
  localStorage.removeItem("usuario");
  location.href = "login.html";
}