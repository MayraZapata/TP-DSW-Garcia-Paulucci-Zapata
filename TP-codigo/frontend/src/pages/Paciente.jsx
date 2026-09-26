import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import useFetchList from "../hooks/useFetchList";

export default function Paciente() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const esRegistro = searchParams.get("origen") === "login";
  const { rol, usuario } = useAuth();

  const obrasSociales = useFetchList("/obrasSociales");

  const [pacientes, setPacientes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [idObra, setIdObra] = useState("");

  const obrasUnicas = useMemo(() => {
    const vistos = new Set();
    return obrasSociales.filter((o) => {
      const nombreLimpio = (o.nombreObra || "").trim().toLowerCase();
      if (!nombreLimpio || vistos.has(nombreLimpio)) return false;
      vistos.add(nombreLimpio);
      return true;
    });
  }, [obrasSociales]);

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

  const titulo = esRegistro ? "Registrar Usuario" : rol === "PACIENTE" ? "Editar Datos Personales" : "CRUD Pacientes";
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
    <div className="contenedor">
      <button className="volver" onClick={volver}>Volver</button>
      <h1>{titulo}</h1>

      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
        <input type="text" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
        <input type="text" placeholder="Nombre de Usuario" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label htmlFor="idObra">Obra Social</label>
        <select id="idObra" value={idObra} onChange={(e) => setIdObra(e.target.value)}>
          <option value="">Sin obra social</option>
          {obrasUnicas.map((o) => (
            <option key={o.idObra} value={o.idObra}>{o.nombreObra}</option>
          ))}
        </select>
        <button type="submit">{editingId !== null ? "Guardar cambios" : "Guardar Paciente"}</button>
        {esAdminConLista && editingId !== null && <button type="button" onClick={handleCancelar}>Cancelar edición</button>}
      </form>

      {esAdminConLista && (
        <>
          <hr />
          <h2>Pacientes registrados</h2>
          <input type="text" placeholder="Buscar por nombre, apellido, DNI u obra social..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <ul>
            {filtrados.map((p) => (
              <li key={p.idPaciente}>
                <strong>ID:</strong> {p.idPaciente}<br />
                <strong>Nombre:</strong> {p.nombre} {p.apellido}<br />
                <strong>DNI:</strong> {p.dni || "N/A"}<br />
                <strong>Usuario:</strong> {p.nombreUsuario}<br />
                <strong>Obra Social:</strong> {p.obraSocial?.nombreObra ?? "Sin obra social"}
                <br /><br />
                <button onClick={() => handleEliminar(p.idPaciente)}>Eliminar</button>
                <button onClick={() => handleEditar(p.idPaciente)}>Editar</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}