async function cargarEspecialidades() {

    const respuesta = await fetch("/api/especialidades");
    const especialidades = await respuesta.json();
    const select = document.getElementById("idEspecialidad");

    especialidades.forEach(especialidad => {
        select.innerHTML += ` <option value="${especialidad.idEspecialidad}"> ${especialidad.nombreEspecialidad} </option> `;
    });
}


async function crearMedico() {

    const matricula = document.getElementById("matricula").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const nombreUsuario = document.getElementById("nombreUsuario").value;
    const password = document.getElementById("password").value;
    const idEspecialidad = document.getElementById("idEspecialidad").value;

    const respuesta = await fetch("/api/medicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        alert(datos.message);
        return;
    }

    alert("Médico registrado correctamente");
    cargarMedicos();
}



async function eliminarMedico(matricula) {

    await fetch(`/api/medicos/${matricula}`, { method: "DELETE" });

    cargarMedicos();

}


async function editarMedico(matricula) {

    const nombre = prompt("Nuevo nombre");
    const apellido = prompt("Nuevo apellido");
    const password = prompt("Nueva contraseña");
    const idEspecialidad = prompt("Nuevo ID de Especialidad");

    await fetch(`/api/medicos/${matricula}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            apellido,
            nombreUsuario,
            password,
            idEspecialidad
        })
    });

    cargarMedicos();

}



async function cargarMedicos() {
    const respuesta = await fetch("/api/medicos");
    
    const medicos = await respuesta.json();

    const lista = document.getElementById("listaMedicos");

    lista.innerHTML = "";

    medicos.forEach(medico => {
        lista.innerHTML += `
            <li>
                <strong>Matrícula:</strong> ${medico.matricula}
                <br>
                <strong>Nombre:</strong> ${medico.nombre}
                ${medico.apellido}
                <br>
                <strong>Usuario:</strong> ${medico.nombreUsuario}
                <br>
                <strong>Especialidad:</strong>
                ${medico.especialidad?.nombreEspecialidad ?? "General"}
                <br><br>
                <button onclick="eliminarMedico(${medico.matricula})">
                    Eliminar
                </button>
                <button onclick="editarMedico(${medico.matricula})">
                    Editar
                </button>
            </li>
            <hr>
        `;
    });

}

cargarEspecialidades()

cargarMedicos();