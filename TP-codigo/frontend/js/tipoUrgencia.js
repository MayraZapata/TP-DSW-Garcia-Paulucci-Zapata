async function crearTipoUrgencia() {

    const nombre = document.getElementById("nombre").value;
    const descripcionTipo = document.getElementById("descripcionTipo").value;

    const respuesta = await fetch("/api/tiposUrgencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            descripcionTipo: descripcionTipo || undefined
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    alert("Tipo de Urgencia registrado correctamente");

    document.getElementById("nombre").value = "";
    document.getElementById("descripcionTipo").value = "";

    cargarTiposUrgencia();
}



async function eliminarTipoUrgencia(id) {

    await fetch(`/api/tiposUrgencia/${id}`, { method: "DELETE" });

    cargarTiposUrgencia();

}



async function editarTipoUrgencia(id) {

    const nombre = prompt("Nuevo nombre");
    if (nombre === null) return;

    const descripcionTipo = prompt("Nueva descripción");
    if (descripcionTipo === null) return;

    const respuesta = await fetch(`/api/tiposUrgencia/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            descripcionTipo
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    cargarTiposUrgencia();

}



async function cargarTiposUrgencia() {
    const respuesta = await fetch("/api/tiposUrgencia");

    const tiposUrgencia = await respuesta.json();

    const lista = document.getElementById("listaTiposUrgencia");

    lista.innerHTML = "";

    tiposUrgencia.forEach(tipo => {
        lista.innerHTML += `
            <li>
                <strong>ID:</strong> ${tipo.idTipo}
                <br>
                <strong>Nombre:</strong> ${tipo.nombre}
                <br>
                <strong>Descripción:</strong> ${tipo.descripcionTipo ?? "—"}
                <br><br>
                <button onclick="eliminarTipoUrgencia(${tipo.idTipo})">
                    Eliminar
                </button>
                <button onclick="editarTipoUrgencia(${tipo.idTipo})">
                    Editar
                </button>
            </li>
            <hr>
        `;
    });

}

cargarTiposUrgencia();
