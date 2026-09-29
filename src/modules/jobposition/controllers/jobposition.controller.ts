import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../core/contexts/auth.context";
import { obtenerCargosPorCliente } from "../../../core/services/job_position_customers.service";
import type { JobPositionCustomer } from "../../../core/types";

const ITEMS_POR_PAGINA = 5;

export interface JobPositionFilters {
  busqueda: string;
}

export const FILTROS_JOBPOSITION_INICIALES: JobPositionFilters = {
  busqueda: "",
};

/**
 * @param recargaKey  Al cambiar su valor se vuelve a consultar (lo usa la
 *                    página cuando seccion_1 crea un cargo).
 */
export const useJobPositionController = (
  filtros: JobPositionFilters,
  recargaKey = 0
) => {
  const { custId } = useAuth();

  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);

  // Identifica la última petición para descartar respuestas obsoletas.
  const ultimaPeticion = useRef(0);

  const busqueda = filtros.busqueda.trim().toLowerCase();

  // Al cambiar la búsqueda volvemos a la página 1 (ajuste durante el render).
  const [busquedaPrevia, setBusquedaPrevia] = useState(busqueda);
  if (busquedaPrevia !== busqueda) {
    setBusquedaPrevia(busqueda);
    setPaginaActual(1);
  }

  const cargarCargos = useCallback(async () => {
    if (custId === null) return;

    const peticion = ++ultimaPeticion.current;
    setLoading(true);
    setError(null);

    try {
      const data = await obtenerCargosPorCliente(custId);
      if (peticion !== ultimaPeticion.current) return;
      setCargos(data);
    } catch (err) {
      if (peticion !== ultimaPeticion.current) return;
      console.error("Error al cargar cargos:", err);
      setError("No se pudo cargar la lista de cargos.");
    } finally {
      if (peticion === ultimaPeticion.current) setLoading(false);
    }
  }, [custId]);

  useEffect(() => {
    cargarCargos();
  }, [cargarCargos, recargaKey]);

  const cargosFiltrados = useMemo(() => {
    if (busqueda === "") return cargos;
    return cargos.filter(
      (c) =>
        c.jb_pstn_cust_name.toLowerCase().includes(busqueda) ||
        (c.jb_pstn_cust_description ?? "").toLowerCase().includes(busqueda)
    );
  }, [cargos, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(cargosFiltrados.length / ITEMS_POR_PAGINA)
  );

  // Si al eliminar se queda vacía la última página, retrocede sola.
  const paginaVisible = Math.min(paginaActual, totalPaginas);

  const cargosPagina = useMemo(() => {
    const inicio = (paginaVisible - 1) * ITEMS_POR_PAGINA;
    return cargosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [cargosFiltrados, paginaVisible]);

  return {
    cargosPagina,
    loading,
    error,
    paginaActual: paginaVisible,
    setPaginaActual,
    totalPaginas,
    itemsPorPagina: ITEMS_POR_PAGINA,
    recargar: cargarCargos,
  };
};