async function crearMedico() {
    const nombre =
        document.getElementById("nombre").value;
    const apellido =
        document.getElementById("apellido").value;
    await fetch("/medicos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            apellido
        })
    });
    cargarMedicos();
}

async function eliminarMedico(id) {
    await fetch(`/medicos/${id}`, {
        method: "DELETE"
    });
    cargarMedicos();
}

async function editarMedico (id) {
    const nombre =
        prompt("Nuevo nombre");
    const apellido =
        prompt("Nuevo apellido");
    await fetch(`/medicos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nombre,
            apellido
        })
    });
    cargarMedicos();
}

async function cargarMedicos() {
    const respuesta =
        await fetch("/medicos");
    const medicos =
        await respuesta.json();
    const lista =
        document.getElementById("listaMedicos");
    lista.innerHTML = " ";
    medicos.forEach(medico => {
        lista.innerHTML += `
            <li>
                ${medico.nombre}
                ${medico.apellido}
                <button onclick="eliminarMedico(${medico.id})">
                    Eliminar
                </button>
                <button onclick="editarMedico(${medico.id})">
                    Editar
                </button>
            </li>
        `;
    });
}

cargarMedicos();