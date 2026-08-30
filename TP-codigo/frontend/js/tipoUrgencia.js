let tiposUrgenciaEditando = null;
let tiposUrgenciaCargados = [];



async function guardarTipoUrgencia() { 
    const nombre = document.getElementById("nombre").value; 
    const descripcionTipo = document.getElementById("descripcionTipo").value; 
    if (tiposUrgenciaEditando !== null) { 
        const respuesta = await fetch(
            `/api/tiposUrgencia/${tiposUrgenciaEditando}`, 
            { method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, descripcionTipo }) }
        ); 
        const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al editar tipo de urgencia"); 
            return; 
        } 
        alert("Tipo de urgencia actualizado correctamente"); 
        cancelarEdicion(); 
        cargarTiposUrgencia(); 
        return; 
    } 
    const respuesta = await fetch("/api/tiposUrgencia", 
        { method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ nombre, descripcionTipo: descripcionTipo || undefined }) }
        ); const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al crear tipo de urgencia"); 
            return; 
        } alert("Tipo de urgencia registrada correctamente"); 
        limpiarFormulario(); 
        cargarTiposUrgencia(); 
}



async function eliminarTipoUrgencia(id) {
    if (!confirm("¿Estás seguro de eliminar este tipo de urgencia?")) return;
    const respuesta = await fetch(`/api/tiposUrgencia/${id}`, {
        method: "DELETE"
    });
    if (!respuesta.ok) {
        alert(datos.message || "Error al eliminar tipo de urgencia");
        return;
    }
    cargarTiposUrgencia();
}


function editarTipoUrgencia(id) { 
    const tipoUrgencia = tiposUrgenciaCargados.find( tipoUrgencia => tipoUrgencia.idTipo == id ); 
    if (!tipoUrgencia) { 
        alert("No se encontró el tipo de urgencia"); 
        return; 
    } 
    tiposUrgenciaEditando = id; 
    document.getElementById("nombre").value = tipoUrgencia.nombre || ""; 
    document.getElementById("descripcionTipo").value = tipoUrgencia.descripcionTipo || "";
    document.getElementById("botonGuardar").textContent = "Guardar cambios"; 
    document.getElementById("botonCancelar").style.display = "inline-block"; 
}



function cancelarEdicion() { 
    tiposUrgenciaEditando = null; 
    limpiarFormulario(); 
    document.getElementById("botonGuardar").textContent = "Guardar Tipo de Urgencia"; 
    document.getElementById("botonCancelar").style.display = "none"; 
} 


function limpiarFormulario() { 
    document.getElementById("nombre").value = ""; 
    document.getElementById("descripcionTipo").value = ""; 
}


async function cargarTiposUrgencia() { 
    const respuesta = await fetch("/api/tiposUrgencia"); 
    const tiposUrgencia = await respuesta.json(); 
    
    tiposUrgenciaCargados = tiposUrgencia; 
    const lista = document.getElementById("listaTiposUrgencia"); 
    lista.innerHTML = ""; 
    tiposUrgencia.forEach(tipo => { 
        lista.innerHTML += 
        ` <li> <strong>ID:</strong> ${tipo.idTipo} 
            <br> <strong>Nombre:</strong> ${tipo.nombre} 
            <br> <strong>Descripción:</strong> ${tipo.descripcionTipo ?? "—"} 
            <br><br> <button onclick="eliminarTipoUrgencia(${tipo.idTipo})"> Eliminar </button> 
            <button onclick="editarTipoUrgencia(${tipo.idTipo})"> Editar </button> </li> <hr> `; 
    }); 
}

cargarTiposUrgencia();
