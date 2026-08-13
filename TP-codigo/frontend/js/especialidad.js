async function crearEspecialidad() {

    const nombreEspecialidad = document.getElementById("nombreEspecialidad").value;
    const descripcion = document.getElementById("descripcion").value;

    const respuesta = await fetch("/api/especialidades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombreEspecialidad,
            descripcion: descripcion || undefined
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    alert("Especialidad registrada correctamente");

    document.getElementById("nombreEspecialidad").value = "";
    document.getElementById("descripcion").value = "";

    cargarEspecialidades();
}



async function eliminarEspecialidad(id) {

    await fetch(`/api/especialidades/${id}`, { method: "DELETE" });

    cargarEspecialidades();

}



async function editarEspecialidad(id) {

    const nombreEspecialidad = prompt("Nuevo nombre");
    if (nombreEspecialidad === null) return;

    const descripcion = prompt("Nueva descripción");
    if (descripcion === null) return;

    const respuesta = await fetch(`/api/especialidades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombreEspecialidad,
            descripcion
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    cargarEspecialidades();

}



async function cargarEspecialidades() {
    const respuesta = await fetch("/api/especialidades");

    const especialidades = await respuesta.json();

    const lista = document.getElementById("listaEspecialidades");

    lista.innerHTML = "";

    especialidades.forEach(especialidad => {
        lista.innerHTML += `
            <li>
                <strong>ID:</strong> ${especialidad.idEspecialidad}
                <br>
                <strong>Nombre:</strong> ${especialidad.nombreEspecialidad}
                <br>
                <strong>Descripción:</strong> ${especialidad.descripcion ?? "—"}
                <br><br>
                <button onclick="eliminarEspecialidad(${especialidad.idEspecialidad})">
                    Eliminar
                </button>
                <button onclick="editarEspecialidad(${especialidad.idEspecialidad})">
                    Editar
                </button>
            </li>
            <hr>
        `;
    });

}

cargarEspecialidades();
