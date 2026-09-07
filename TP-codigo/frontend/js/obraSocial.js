let obrasSocialesData = []; // guarda la última lista traída del servidor, para filtrar sin volver a pedirla

async function crearObraSocial() {

    const nombreObra = document.getElementById("nombreObra").value;
    const monto = document.getElementById("monto").value;

    const respuesta = await fetch("/api/obrasSociales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombreObra,
            monto: Number(monto)
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    alert("Obra Social registrada correctamente");

    document.getElementById("nombreObra").value = "";
    document.getElementById("monto").value = "";

    cargarObrasSociales();
}



async function eliminarObraSocial(id) {

    await fetch(`/api/obrasSociales/${id}`, { method: "DELETE" });

    cargarObrasSociales();

}



async function editarObraSocial(id) {

    const nombreObra = prompt("Nuevo nombre");
    if (nombreObra === null) return;

    const monto = prompt("Nuevo monto");
    if (monto === null) return;

    const respuesta = await fetch(`/api/obrasSociales/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombreObra,
            monto: Number(monto)
        })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
        alert(datos.message);
        return;
    }

    cargarObrasSociales();

}



function renderObrasSociales(obrasSociales) {

    const lista = document.getElementById("listaObrasSociales");

    lista.innerHTML = "";

    if (obrasSociales.length === 0) {
        lista.innerHTML = "<li>No se encontraron obras sociales.</li>";
        return;
    }

    obrasSociales.forEach(obraSocial => {
        lista.innerHTML += `
            <li>
                <strong>ID:</strong> ${obraSocial.idObra}
                <br>
                <strong>Nombre:</strong> ${obraSocial.nombreObra}
                <br>
                <strong>Monto:</strong> $${obraSocial.monto}
                <br><br>
                <button onclick="eliminarObraSocial(${obraSocial.idObra})">
                    Eliminar
                </button>
                <button onclick="editarObraSocial(${obraSocial.idObra})">
                    Editar
                </button>
            </li>
            <hr>
        `;
    });

}



async function cargarObrasSociales() {
    const respuesta = await fetch("/api/obrasSociales");

    obrasSocialesData = await respuesta.json();

    filtrarObrasSociales();
}



function filtrarObrasSociales() {

    const termino = document.getElementById("buscadorObraSocial").value.trim().toLowerCase();

    const filtradas = !termino
        ? obrasSocialesData
        : obrasSocialesData.filter(o =>
            o.nombreObra?.toLowerCase().includes(termino)
        );

    renderObrasSociales(filtradas);

}

cargarObrasSociales();
