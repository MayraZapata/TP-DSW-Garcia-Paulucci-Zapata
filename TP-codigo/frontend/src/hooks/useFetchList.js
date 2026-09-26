import { useState, useEffect, useCallback } from "react";
import { api } from "../api/client";

export default function useFetchList(endpoint) {
  const [items, setItems] = useState([]);

  const cargar = useCallback(async () => {
    const data = await api.get(endpoint);
    setItems(data);
  }, [endpoint]);

  useEffect(() => {
    // eslint-disable-next-line
    cargar();
  }, [cargar]);

  return items;
}