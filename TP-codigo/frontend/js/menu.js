const rol =
    localStorage.getItem("rol");
const tituloRol =
    document.getElementById("tituloRol");
const btnPacientes =
    document.getElementById("btnPacientes");
const btnMedicos =
    document.getElementById("btnMedicos");
const btnTurnos =
    document.getElementById("btnTurnos");
if (!rol) {
    location.href = "login.html";
}

if (rol === "ADMIN") {
    tituloRol.textContent =
        "Administrador";
}

else if (rol === "MEDICO") {
    tituloRol.textContent =
        "Médico";
    btnPacientes.style.display =
        "none";
}

else if (rol === "PACIENTE") {
    tituloRol.textContent =
        "Paciente";
    btnPacientes.style.display =
        "none";
    btnMedicos.style.display =
        "none";
}

function cerrarSesion() {
    localStorage.removeItem("rol");
    location.href = "login.html";
}