async function crearPaciente() {
    const nombre =
        document.getElementById("nombre").value;
    const apellido =
        document.getElementById("apellido").value;
    const dni =
        document.getElementById("dni").value;
    await fetch("/pacientes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            apellido,
            dni
        })
    });
    cargarPacientes();
}

async function eliminarPaciente(id) {
    await fetch(`/pacientes/${id}`, {
        method: "DELETE"
    });
    cargarPacientes();
}

async function editarPaciente(id) {
    const nombre =
        prompt("Nuevo nombre");
    const apellido =
        prompt("Nuevo apellido");
    const dni =
        prompt("Nuevo DNI");
    await fetch(`/pacientes/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            apellido,
            dni
        })
    });
    cargarPacientes();
}

async function cargarPacientes() {
    const respuesta =
        await fetch("/pacientes");
    const pacientes =
        await respuesta.json();
    const lista =
        document.getElementById("listaPacientes");
    lista.innerHTML = " ";
    pacientes.forEach(paciente => {
        lista.innerHTML += `
            <li>
                ${paciente.nombre}
                ${paciente.apellido}
                (${paciente.dni})
                <button onclick="eliminarPaciente(${paciente.id})">
                    Eliminar
                </button>
                <button onclick="editarPaciente(${paciente.id})">
                    Editar
                </button>
            </li>
        `;
    });
}

cargarPacientes();