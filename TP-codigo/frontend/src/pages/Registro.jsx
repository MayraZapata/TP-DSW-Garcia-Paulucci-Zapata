import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { IconoLogo } from "../components/Iconos";
import PacienteForm from "../components/PacienteForm";

export default function Registro() {
  const navigate = useNavigate();

  async function registrar(datos) {
    await api.post("/pacientes", datos);
    alert("Cuenta creada correctamente. Ya podés iniciar sesión.");
    navigate("/login");
  }

  return (
    <div className="login-pagina">
      <Link to="/login" className="login-volver">← Volver</Link>
      <div className="login-tarjeta">
        <Link to="/" className="login-logo"><IconoLogo width="26" height="26" /> Gestión de Turnos</Link>
        <h1>Crear cuenta</h1>
        <p className="login-sub">Completá tus datos para registrarte como paciente.</p>
        <PacienteForm textoGuardar="Registrarme" onSubmit={registrar} />
        <div className="login-extra">¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link></div>
      </div>
    </div>
  );
}