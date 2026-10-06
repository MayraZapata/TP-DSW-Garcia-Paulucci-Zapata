import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import PacienteForm from "../components/PacienteForm";
import useMensaje from "../hooks/useMensaje";
import Mensaje from "../components/Mensaje";

export default function MisDatos() {
  const { usuario, actualizarUsuario } = useAuth();
  const [paciente, setPaciente] = useState(null);
  const aviso = useMensaje();
  const idPaciente = usuario?.idPaciente;

  useEffect(() => {
    if (!idPaciente) return;
    api.get(`/pacientes/${idPaciente}`).then(setPaciente).catch(() => aviso.error("No se pudieron cargar tus datos"));
    // eslint-disable-next-line
  }, [idPaciente]);

  async function guardar(datos) {
    const actualizado = await api.put(`/pacientes/${idPaciente}`, datos);
    actualizarUsuario({ nombre: actualizado.nombre, apellido: actualizado.apellido, dni: actualizado.dni });
  }

  return (
    <div className="gestion gestion-solo">
      <div className="gestion-header"><h1>Editar Datos Personales</h1></div>
      <Mensaje mensaje={aviso.mensaje} />
      {paciente && <PacienteForm className="gestion-form" paciente={paciente} textoGuardar="Guardar cambios" mensajeExito="Datos actualizados correctamente" onSubmit={guardar} />}
    </div>
  );
}