const BASE_URL = "/api";

// AuthContext registra acá qué hacer cuando el servidor dice "tu sesión venció"
let alExpirarSesion = null;
export function registrarAlExpirarSesion(fn) {
    alExpirarSesion = fn;
}

async function request(path, options = {}) {
    // La cookie del token viaja sola: el front y el back comparten origen (proxy de Vite)
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        // 401 en /login es "clave incorrecta" y en /login/me es "todavía no hay sesión": no son vencimientos
        if (res.status === 401 && path !== "/login" && path !== "/login/me") {
            alExpirarSesion?.();
        }
        throw new Error(data?.message || "Error en la petición");
    }
    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: (path) => request(path, { method: "DELETE" }),
};