import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await login(usuario, password);
            navigate("/menu");
        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <div className="contenedor">
            <h1>Iniciar Sesión</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Iniciar Sesión</button>
                <div className="registro"><Link to="/pacientes?origen=login" className="reg">¿No tienes cuenta? Regístrate</Link></div>
            </form>
        </div>
    );
}