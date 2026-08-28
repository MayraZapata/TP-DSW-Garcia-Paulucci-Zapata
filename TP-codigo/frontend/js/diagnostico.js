async function crearDiagnostico() {

    const nombreDiagnostico = document.getElementById("nombreDiagnostico").value;
    const tratamiento = document.getElementById("tratamiento").value;

    const respuesta = await fetch("/api/diagnosticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombreDiagnostico,
            tratamiento: tratamiento || undefined
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    alert("Diagnóstico registrado correctamente");

    document.getElementById("nombreDiagnostico").value = "";
    document.getElementById("tratamiento").value = "";

    cargarDiagnosticos();
}



async function eliminarDiagnostico(id) {

    await fetch(`/api/diagnosticos/${id}`, { method: "DELETE" });

    cargarDiagnosticos();

}



async function editarDiagnostico(id) {

    const nombreDiagnostico = prompt("Nuevo nombre");
    if (nombreDiagnostico === null) return;

    const tratamiento = prompt("Nuevo tratamiento");
    if (tratamiento === null) return;

    const respuesta = await fetch(`/api/diagnosticos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombreDiagnostico,
            tratamiento
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    cargarDiagnosticos();

}



async function cargarDiagnosticos() {
    const respuesta = await fetch("/api/diagnosticos");

    const diagnosticos = await respuesta.json();

    const lista = document.getElementById("listaDiagnosticos");

    lista.innerHTML = "";

    diagnosticos.forEach(diagnostico => {
        lista.innerHTML += `
            <li>
                <strong>ID:</strong> ${diagnostico.idDiagnostico}
                <br>
                <strong>Nombre:</strong> ${diagnostico.nombreDiagnostico}
                <br>
                <strong>Tratamiento:</strong> ${diagnostico.tratamiento ?? "—"}
                <br><br>
                <button onclick="eliminarDiagnostico(${diagnostico.idDiagnostico})">
                    Eliminar
                </button>
                <button onclick="editarDiagnostico(${diagnostico.idDiagnostico})">
                    Editar
                </button>
            </li>
            <hr>
        `;
    });

}

cargarDiagnosticos();
