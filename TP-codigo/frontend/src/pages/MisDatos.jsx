import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import PacienteForm from "../components/PacienteForm";

export default function MisDatos() {
  const { usuario, actualizarUsuario } = useAuth();
  const [paciente, setPaciente] = useState(null);
  const idPaciente = usuario?.idPaciente;

  useEffect(() => {
    if (!idPaciente) return;
    api.get(`/pacientes/${idPaciente}`).then(setPaciente).catch(() => alert("No se pudieron cargar tus datos"));
  }, [idPaciente]);

  async function guardar(datos) {
    const actualizado = await api.put(`/pacientes/${idPaciente}`, datos);
    actualizarUsuario({ nombre: actualizado.nombre, apellido: actualizado.apellido, dni: actualizado.dni });
    alert("Datos actualizados correctamente");
  }

  return (
    <div className="gestion gestion-solo">
      <div className="gestion-header"><h1>Editar Datos Personales</h1></div>
      {paciente && <PacienteForm className="gestion-form" paciente={paciente} textoGuardar="Guardar cambios" onSubmit={guardar} />}
    </div>
  );
}