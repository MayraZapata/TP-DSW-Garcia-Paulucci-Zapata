let diagnosticoEditando = null;
let diagnosticosCargados = [];



async function guardarDiagnostico() { 
    const nombreDiagnostico = document.getElementById("nombreDiagnostico").value; 
    const tratamiento = document.getElementById("tratamiento").value; 
    if (diagnosticoEditando !== null) { 
        const respuesta = await fetch(
            `/api/diagnosticos/${diagnosticoEditando}`, 
            { method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombreDiagnostico, tratamiento }) }
        ); 
        const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al editar diagnóstico"); 
            return; 
        } 
        alert("Diagnóstico actualizado correctamente"); 
        cancelarEdicion(); 
        cargarDiagnosticos(); 
        return; 
    } 
    const respuesta = await fetch("/api/diagnosticos", 
        { method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ nombreDiagnostico, tratamiento: tratamiento || undefined }) }
        ); const datos = await respuesta.json(); 
        if (!respuesta.ok) { 
            alert(datos.message || "Error al crear diagnóstico"); 
            return; 
        } alert("Diagnóstico registrado correctamente"); 
        limpiarFormulario(); 
        cargarDiagnosticos(); 
    }



async function eliminarDiagnostico(id) {
    if (!confirm("¿Estás seguro de eliminar este diagnóstico?")) return;
    const respuesta = await fetch(`/api/diagnosticos/${id}`, {
        method: "DELETE"
    });
    if (!respuesta.ok) {
        alert(datos.message || "Error al eliminar diagnóstico");
        return;
    }
    cargarDiagnosticos();
}



function editarDiagnostico(id) { 
    const diagnostico = diagnosticosCargados.find( diagnostico => diagnostico.idDiagnostico == id ); 
    if (!diagnostico) { 
        alert("No se encontró el diagnóstico"); 
        return; 
    } 
    diagnosticoEditando = id; 
    document.getElementById("nombreDiagnostico").value = diagnostico.nombreDiagnostico || ""; 
    document.getElementById("tratamiento").value = diagnostico.tratamiento ?? "";
    document.getElementById("botonGuardar").textContent = "Guardar cambios"; 
    document.getElementById("botonCancelar").style.display = "inline-block"; 
}



function cancelarEdicion() { 
    diagnosticoEditando = null; 
    limpiarFormulario(); 
    document.getElementById("botonGuardar").textContent = "Guardar Diagnóstico"; 
    document.getElementById("botonCancelar").style.display = "none"; 
} 


function limpiarFormulario() { 
    document.getElementById("nombreDiagnostico").value = ""; 
    document.getElementById("tratamiento").value = ""; 
}


async function cargarDiagnosticos() { 
    const respuesta = await fetch("/api/diagnosticos"); 
    const diagnosticos = await respuesta.json(); 
    
    diagnosticosCargados = diagnosticos; 
    const lista = document.getElementById("listaDiagnosticos"); 
    lista.innerHTML = ""; 
    diagnosticos.forEach(diagnostico => { 
        lista.innerHTML += 
        ` <li> <strong>ID:</strong> ${diagnostico.idDiagnostico} 
            <br> <strong>Nombre:</strong> ${diagnostico.nombreDiagnostico} 
            <br> <strong>Tratamiento:</strong> ${diagnostico.tratamiento ?? "—"} 
            <br><br> <button onclick="eliminarDiagnostico(${diagnostico.idDiagnostico})"> Eliminar </button> 
            <button onclick="editarDiagnostico(${diagnostico.idDiagnostico})"> Editar </button> </li> <hr> `; 
    }); 
}

cargarDiagnosticos();
