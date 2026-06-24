/*async function iniciarSesion() {
    console.log(document.getElementById("usuario"));
    console.log(document.getElementById("password"));
    const usuario =
        document.getElementById("usuario").value;
    const password =
        document.getElementById("password").value;
    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario,
            password
        })
    });

    if (response.ok) {
        const datos =
            await response.json();
        localStorage.setItem(
            "rol",
            datos.rol
        );
        location.href =
            "menu.html";
    } else {
        alert("Credenciales incorrectas");
    }
};*/




async function iniciarSesion() {
    const usuario = document.getElementById("usuario").value;
    const password = document.getElementById("password").value;
    
    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario, password })
        });

        if (response.ok) {
            const datos = await response.json();
            console.log("Datos recibidos del servidor:", datos); // <-- Para ver qué llega
            
            localStorage.setItem("rol", datos.rol);
            location.href = "menu.html";
        } else {
            const errorDatos = await response.json();
            alert("Error: " + (errorDatos.mensaje || "Credenciales incorrectas"));
        }
    } catch (error) {
        console.error("Error en la petición fetch:", error);
    }
}