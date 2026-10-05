import { createContext, useContext, useState, useEffect } from "react";
import { api, registrarAlExpirarSesion } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [rol, setRol] = useState(null);
    const [usuario, setUsuario] = useState(null);
    // true hasta que sepamos si hay sesión: evita que al recargar te mande al login por error
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Restos de la versión anterior: ya no se guarda nada en localStorage
        localStorage.removeItem("rol");
        localStorage.removeItem("usuario");

        registrarAlExpirarSesion(() => {
            setRol(null);
            setUsuario(null);
        });

        (async () => {
            try {
                const datos = await api.get("/login/me");
                setRol(datos.rol);
                setUsuario(datos.usuario || {});
            } catch {
                setRol(null);
                setUsuario(null);
            } finally {
                setCargando(false);
            }
        })();
    }, []);

    async function login(nombreUsuario, password) {
        const datos = await api.post("/login", { usuario: nombreUsuario, password });
        setRol(datos.rol);
        setUsuario(datos.usuario || {});
    }

    async function logout() {
        try {
            await api.post("/login/logout");
        } catch {
            // aunque falle el aviso al servidor, cerramos la sesión de este lado
        }
        setRol(null);
        setUsuario(null);
    }

    function actualizarUsuario(parcial) {
        setUsuario((u) => ({ ...u, ...parcial }));
    }

    return (
        <AuthContext.Provider value={{ rol, usuario, cargando, login, logout, actualizarUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}