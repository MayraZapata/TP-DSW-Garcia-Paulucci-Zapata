import { createContext, useContext, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [rol, setRol] = useState(() => localStorage.getItem("rol"));
    const [usuario, setUsuario] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("usuario")) || null;
        } catch {
            return null;
        }
    });

    async function login(nombreUsuario, password) {
        const datos = await api.post("/login", { usuario: nombreUsuario, password });
        localStorage.setItem("rol", datos.rol);
        localStorage.setItem("usuario", JSON.stringify(datos.usuario || {}));
        setRol(datos.rol);
        setUsuario(datos.usuario || {});
    }

    function logout() {
        localStorage.removeItem("rol");
        localStorage.removeItem("usuario");
        setRol(null);
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{ rol, usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
