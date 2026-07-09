async function cargarObrasSociales() {

    const respuesta = await fetch("/api/obrasSociales");
    const obras = await respuesta.json();
    const select = document.getElementById("idObra");
    
    obras.forEach(obra => {
        select.innerHTML += ` <option value="${obra.idObra}"> ${obra.nombreObra} </option> `;
    });
}

async function crearPaciente() {

    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const dni = document.getElementById("dni").value;
    const nombreUsuario = document.getElementById("nombreUsuario").value;
    const password = document.getElementById("password").value;
    const idObra = document.getElementById("idObra").value;

    const respuesta = await fetch("/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            apellido,
            dni,
            nombreUsuario,
            password,
            idObra 
        })
    });
    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    alert("Paciente registrado correctamente");

    cargarPacientes();
}



async function eliminarPaciente(id) {

    await fetch(`/api/pacientes/${id}`, { method: "DELETE" });

    cargarPacientes();

}



async function editarPaciente(id) {

    const nombre = prompt("Nuevo nombre");
    const apellido = prompt("Nuevo apellido");
    const dni = prompt("Nuevo DNI");
    const password = prompt("Nueva contraseña");
    const idObra = prompt("Nuevo ID de Obra Social");

    await fetch(`/api/pacientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            apellido,
            dni,
            password,
            idObra: idObra === "" ? null : Number(idObra)
        })
    });

    cargarPacientes();

}



async function cargarPacientes() {
    const respuesta = await fetch("/api/pacientes");
    
    const pacientes = await respuesta.json();

    const lista = document.getElementById("listaPacientes");

    lista.innerHTML = "";

    pacientes.forEach(paciente => {
        lista.innerHTML += `
            <li>
                <strong>ID:</strong> ${paciente.idPaciente}
                <br>
                <strong>Nombre:</strong> ${paciente.nombre}
                ${paciente.apellido}
                <br>
                <strong>Usuario:</strong> ${paciente.nombreUsuario}
                <br>
                <strong>Obra Social:</strong>
                ${paciente.obraSocial?.nombreObra ?? "Sin obra social"}
                <br><br>
                <button onclick="eliminarPaciente(${paciente.idPaciente})">
                    Eliminar
                </button>
                <button onclick="editarPaciente(${paciente.idPaciente})">
                    Editar
                </button>
            </li>
            <hr>
        `;
    });

}

cargarObrasSociales();

cargarPacientes();