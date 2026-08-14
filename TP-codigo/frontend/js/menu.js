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
const btnObraSocial =
    document.getElementById("btnObraSocial");
const btnEspecialidad =
    document.getElementById("btnEspecialidad");
const btnDiagnostico =
    document.getElementById("btnDiagnostico");
const btnTipoUrgencia =
    document.getElementById("btnTipoUrgencia");
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
    btnObraSocial.style.display =
        "none";
    btnEspecialidad.style.display =
        "none";
    btnDiagnostico.style.display =
        "none";
    btnTipoUrgencia.style.display =
        "none";
}

else if (rol === "PACIENTE") {
    tituloRol.textContent =
        "Paciente";
    btnPacientes.style.display =
        "none";
    btnMedicos.style.display =
        "none";
    btnObraSocial.style.display =
        "none";
    btnEspecialidad.style.display =
        "none";
    btnDiagnostico.style.display =
        "none";
    btnTipoUrgencia.style.display =
        "none";
}

function cerrarSesion() {
    localStorage.removeItem("rol");
    location.href = "login.html";
}