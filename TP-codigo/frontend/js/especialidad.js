let especialidadesData = []; // guarda la última lista traída del servidor, para filtrar sin volver a pedirla

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



// Antes esto estaba pegado adentro de cargarEspecialidades().
// Lo separamos para poder llamarlo tanto con la lista completa como con la lista filtrada.
function renderEspecialidades(especialidades) {

    const lista = document.getElementById("listaEspecialidades");

    lista.innerHTML = "";

    if (especialidades.length === 0) {
        lista.innerHTML = "<li>No se encontraron especialidades.</li>";
        return;
    }

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



async function cargarEspecialidades() {
    const respuesta = await fetch("/api/especialidades");

    especialidadesData = await respuesta.json();

    // Si ya había algo escrito en el buscador, lo respeta al recargar
    filtrarEspecialidades();
}



function filtrarEspecialidades() {

    const termino = document.getElementById("buscadorEspecialidad").value.trim().toLowerCase();

    const filtradas = !termino
        ? especialidadesData
        : especialidadesData.filter(e =>
            e.nombreEspecialidad?.toLowerCase().includes(termino) ||
            e.descripcion?.toLowerCase().includes(termino)
        );

    renderEspecialidades(filtradas);

}

cargarEspecialidades();
