import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";
import { unicosPor } from "../utils/unicos";

export default function Paciente() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const esRegistro = searchParams.get("origen") === "login";
  const { rol, usuario } = useAuth();

  const obrasUnicas = unicosPor(useFetchList("/obrasSociales"), "nombreObra");

  const [pacientes, setPacientes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [idObra, setIdObra] = useState("");

  function limpiarFormulario() {
    setNombre("");
    setApellido("");
    setDni("");
    setNombreUsuario("");
    setPassword("");
    setIdObra("");
  }

  function cargarFormularioDesde(paciente) {
    setNombre(paciente.nombre || "");
    setApellido(paciente.apellido || "");
    setDni(paciente.dni || "");
    setNombreUsuario(paciente.nombreUsuario || "");
    setPassword("");
    setIdObra(paciente.obraSocial?.idObra || "");
  }

  async function cargarListaAdmin() {
    try {
      const data = await api.get("/pacientes");
      setPacientes(data);
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
    }
  }

  async function cargarPropiosDatos() {
    const idPaciente = usuario?.idPaciente;
    if (!idPaciente) return;
    try {
      const paciente = await api.get(`/pacientes/${idPaciente}`);
      setPacientes([paciente]);
      setEditingId(paciente.idPaciente);
      cargarFormularioDesde(paciente);
    } catch {
      alert("No se pudieron cargar tus datos");
    }
  }

  useEffect(() => {
    if (esRegistro) return;
    if (!rol) {
      navigate("/login");
      return;
    }
    if (rol === "PACIENTE") {
      // eslint-disable-next-line
      cargarPropiosDatos();
      return;
    }
    if (rol === "ADMIN") {
      // eslint-disable-next-line
      cargarListaAdmin();
    }
    // eslint-disable-next-line
  }, [rol, esRegistro]);

  function volver() {
    navigate(esRegistro ? "/login" : "/menu");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const idObraVal = idObra === "" ? null : Number(idObra);

    try {
      if (editingId !== null) {
        const datosActualizar = { nombre, apellido, dni, nombreUsuario, idObra: idObraVal };
        if (password !== "") datosActualizar.password = password;
        await api.put(`/pacientes/${editingId}`, datosActualizar);
        alert("Paciente actualizado correctamente");
        if (rol === "ADMIN") {
          setEditingId(null);
          limpiarFormulario();
          cargarListaAdmin();
        }
        return;
      }

      await api.post("/pacientes", { nombre, apellido, dni, nombreUsuario, password, idObra: idObraVal });
      alert("Paciente registrado correctamente");

      if (rol !== "ADMIN") {
        volver();
        return;
      }
      limpiarFormulario();
      cargarListaAdmin();
    } catch (error) {
      alert(error.message);
    }
  }

  function handleEditar(idPaciente) {
    const paciente = pacientes.find((p) => p.idPaciente === idPaciente);
    if (!paciente) return;
    setEditingId(idPaciente);
    cargarFormularioDesde(paciente);
  }

  function handleCancelar() {
    setEditingId(null);
    limpiarFormulario();
  }

  async function handleEliminar(idPaciente) {
    if (!confirm("¿Estás seguro de eliminar este paciente?")) return;
    try {
      await api.del(`/pacientes/${idPaciente}`);
      cargarListaAdmin();
    } catch (error) {
      alert(error.message);
    }
  }

  const titulo = esRegistro ? "Registrar Usuario" : rol === "PACIENTE" ? "Editar Datos Personales" : "Gestión de Pacientes";
  const esAdminConLista = rol === "ADMIN" && !esRegistro;

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return pacientes;
    return pacientes.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(termino) ||
        p.apellido?.toLowerCase().includes(termino) ||
        p.dni?.toLowerCase().includes(termino) ||
        p.obraSocial?.nombreObra?.toLowerCase().includes(termino)
    );
  }, [pacientes, busqueda]);

  return (
    <div className="gestion">
      <div className="gestion-header"><h1>{titulo}</h1></div>

      <div className={esAdminConLista ? "gestion-cuerpo" : "gestion-cuerpo gestion-cuerpo-solo"}>
        <form className="gestion-form" onSubmit={handleSubmit}>
          <input className="campo" type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className="campo" type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          <input className="campo" type="text" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
          <input className="campo" type="text" placeholder="Nombre de Usuario" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
          <input className="campo" type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <select className="campo" value={idObra} onChange={(e) => setIdObra(e.target.value)}>
            <option value="">Sin obra social</option>
            {obrasUnicas.map((o) => (
              <option key={o.idObra} value={o.idObra}>{o.nombreObra}</option>
            ))}
          </select>
          <button type="submit" className="btn">{editingId !== null ? "Guardar cambios" : "Guardar paciente"}</button>
          {esAdminConLista && editingId !== null && <button type="button" className="btn btn-secundario" onClick={handleCancelar}>Cancelar edición</button>}
        </form>

        {esAdminConLista && (
          <div className="gestion-lista">
            <input className="campo" type="text" placeholder="Buscar por nombre, apellido, DNI u obra social..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            <div className="gestion-lista-items">
              {filtrados.length === 0 ? (
                <p className="info-sub">No hay pacientes para mostrar.</p>
              ) : (
                filtrados.map((p) => (
                  <div className="item-card" key={p.idPaciente}>
                    <strong>{p.nombre} {p.apellido}</strong>
                    <p style={{ margin: "6px 0 0" }}>
                      DNI: {p.dni || "N/A"}<br />
                      Usuario: {p.nombreUsuario}<br />
                      Obra Social: {p.obraSocial?.nombreObra ?? "Sin obra social"}
                    </p>
                    <div className="item-card-acciones">
                      <button className="btn btn-secundario" onClick={() => handleEditar(p.idPaciente)}>Editar</button>
                      <button className="btn btn-peligro" onClick={() => handleEliminar(p.idPaciente)}>Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}