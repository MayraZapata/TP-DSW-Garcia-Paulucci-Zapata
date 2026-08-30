let especialidadEditando = null;
let especialidadesCargadas = [];



async function guardarEspecialidad() { 
    const nombreEspecialidad = document.getElementById("nombreEspecialidad").value; 
    const descripcion = document.getElementById("descripcion").value; 
    if (especialidadEditando !== null) { 
        const respuesta = await fetch(
            `/api/especialidades/${especialidadEditando}`, 
            { method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombreEspecialidad, descripcion }) }
        ); 
        const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al editar especialidad"); 
            return; 
        } 
        alert("Especialidad actualizada correctamente"); 
        cancelarEdicion(); 
        cargarEspecialidades(); 
        return; 
    } 
    const respuesta = await fetch("/api/especialidades", 
        { method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ nombreEspecialidad, descripcion: descripcion || undefined }) }
        ); const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al crear especialidad"); 
            return; 
        } alert("Especialidad registrada correctamente"); 
        limpiarFormulario(); 
        cargarEspecialidades(); 
    }



async function eliminarEspecialidad(id) {
    if (!confirm("¿Estás seguro de eliminar esta especialidad?")) return;
    const respuesta = await fetch(`/api/especialidades/${id}`, {
        method: "DELETE"
    });
    if (!respuesta.ok) {
        alert(datos.message || "Error al eliminar especialidad");
        return;
    }
    cargarEspecialidades();
}




function editarEspecialidad(id) { 
    const especialidad = especialidadesCargadas.find( especialidad => especialidad.idEspecialidad == id ); 
    if (!especialidad) { 
        alert("No se encontró la especialidad"); 
        return; 
    } 
    especialidadEditando = id; 
    document.getElementById("nombreEspecialidad").value = especialidad.nombreEspecialidad || ""; 
    document.getElementById("descripcion").value = especialidad.descripcion || "";
    document.getElementById("botonGuardar").textContent = "Guardar cambios"; 
    document.getElementById("botonCancelar").style.display = "inline-block"; 
}



function cancelarEdicion() { 
    especialidadEditando = null; 
    limpiarFormulario(); 
    document.getElementById("botonGuardar").textContent = "Guardar Especialidad"; 
    document.getElementById("botonCancelar").style.display = "none"; 
} 


function limpiarFormulario() { 
    document.getElementById("nombreEspecialidad").value = ""; 
    document.getElementById("descripcion").value = ""; 
}


async function cargarEspecialidades() { 
    const respuesta = await fetch("/api/especialidades"); 
    const especialidades = await respuesta.json(); 
    
    especialidadesCargadas = especialidades; 
    const lista = document.getElementById("listaEspecialidades"); 
    lista.innerHTML = ""; 
    especialidades.forEach(especialidad => { 
        lista.innerHTML += 
        ` <li> <strong>ID:</strong> ${especialidad.idEspecialidad} 
            <br> <strong>Nombre:</strong> ${especialidad.nombreEspecialidad} 
            <br> <strong>Descripción:</strong> ${especialidad.descripcion ?? "—"} 
            <br><br> <button onclick="eliminarEspecialidad(${especialidad.idEspecialidad})"> Eliminar </button> 
            <button onclick="editarEspecialidad(${especialidad.idEspecialidad})"> Editar </button> </li> <hr> `; 
    }); 
}

cargarEspecialidades();
