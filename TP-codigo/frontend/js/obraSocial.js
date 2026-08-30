let obraEditando = null;
let obrasSocialesCargadas = [];



async function guardarObraSocial() { 
    const nombreObra = document.getElementById("nombreObra").value; 
    const monto = document.getElementById("monto").value; 
    if (obraEditando !== null) { 
        const respuesta = await fetch(
            `/api/obrasSociales/${obraEditando}`, 
            { method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombreObra, monto: Number(monto) }) }
        ); 
        const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al editar obra social"); 
            return; 
        } 
        alert("Obra social actualizada correctamente"); 
        cancelarEdicion(); 
        cargarObrasSociales(); 
        return; 
    } 
    const respuesta = await fetch("/api/obrasSociales", 
        { method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ nombreObra, monto: Number(monto) }) }
        ); const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al crear obra social"); 
            return; 
        } alert("Obra social registrada correctamente"); 
        limpiarFormulario(); 
        cargarObrasSociales(); 
    }





async function eliminarObraSocial(id) {
    if (!confirm("¿Estás seguro de eliminar esta obra social?")) return;
    const respuesta = await fetch(`/api/obrasSociales/${id}`, {
        method: "DELETE"
    });
    if (!respuesta.ok) {
        alert(datos.message || "Error al eliminar obra social");
        return;
    }
    cargarObrasSociales();
}


function editarObraSocial(id) { 
    const obraSocial = obrasSocialesCargadas.find( obraSocial => obraSocial.idObra == id ); 
    if (!obraSocial) { 
        alert("No se encontró la obra social"); 
        return; 
    } 
    obraEditando = id; 
    document.getElementById("nombreObra").value = obraSocial.nombreObra || ""; 
    document.getElementById("monto").value = obraSocial.monto ?? "";    
    document.getElementById("botonGuardar").textContent = "Guardar cambios"; 
    document.getElementById("botonCancelar").style.display = "inline-block"; 
}



function cancelarEdicion() { 
    obraEditando = null; 
    limpiarFormulario(); 
    document.getElementById("botonGuardar").textContent = "Guardar Obra Social"; 
    document.getElementById("botonCancelar").style.display = "none"; 
} 


function limpiarFormulario() { 
    document.getElementById("nombreObra").value = ""; 
    document.getElementById("monto").value = ""; 
}


async function cargarObrasSociales() { 
    const respuesta = await fetch("/api/obrasSociales"); 
    const obrasSociales = await respuesta.json(); 
    
    obrasSocialesCargadas = obrasSociales; 
    const lista = document.getElementById("listaObrasSociales"); 
    lista.innerHTML = ""; 
    obrasSociales.forEach(obraSocial => { 
        lista.innerHTML += 
        ` <li> <strong>ID:</strong> ${obraSocial.idObra} 
            <br> <strong>Nombre:</strong> ${obraSocial.nombreObra} 
            <br> <strong>Monto:</strong> ${obraSocial.monto ?? "—"} 
            <br><br> <button onclick="eliminarObraSocial(${obraSocial.idObra})"> Eliminar </button> 
            <button onclick="editarObraSocial(${obraSocial.idObra})"> Editar </button> </li> <hr> `; 
    }); 
}

cargarObrasSociales();
