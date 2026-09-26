import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

export default function useCrud(endpoint) {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const cargar = useCallback(async () => {
    const data = await api.get(endpoint);
    setItems(data);
  }, [endpoint]);

  useEffect(() => {
    // Cargar datos al montar es el uso oficial de useEffect
    // (sincronizar con un sistema externo: el backend).
    // eslint-disable-next-line
    cargar();
  }, [cargar]);

  async function guardar(datos) {
    if (editingId !== null) {
      await api.put(`${endpoint}/${editingId}`, datos);
    } else {
      await api.post(endpoint, datos);
    }
    setEditingId(null);
    await cargar();
  }

  async function eliminar(id) {
    await api.del(`${endpoint}/${id}`);
    await cargar();
  }

  function editar(id) {
    setEditingId(id);
  }

  function cancelarEdicion() {
    setEditingId(null);
  }

  return { items, editingId, guardar, eliminar, editar, cancelarEdicion };
}