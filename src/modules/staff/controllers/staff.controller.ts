import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../core/contexts/auth.context";
import { listStaff, setStaffActive, getStaffImageUrl } from "../../../core/services";
import type { StaffFilters, StaffListItem } from "../../../core/types";

const ITEMS_POR_PAGINA = 5;
const RETARDO_BUSQUEDA_MS = 300;

export const FILTROS_STAFF_INICIALES: StaffFilters = {
  busqueda: "",
  cargoId: null,
  rolId: null,
  estado: "",
};

const useValorConRetardo = <T>(valor: T, retardoMs: number): T => {
  const [valorConRetardo, setValorConRetardo] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setValorConRetardo(valor), retardoMs);
    return () => clearTimeout(id);
  }, [valor, retardoMs]);

  return valorConRetardo;
};

export const useStaffController = (filtros: StaffFilters) => {
  const { custId, custNameBucket } = useAuth();

  const [staffsPagina, setStaffsPagina] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  // Identifica la última petición para descartar respuestas obsoletas.
  const ultimaPeticion = useRef(0);

  // La búsqueda de texto se retrasa; los selects se aplican al instante.
  const busqueda = useValorConRetardo(filtros.busqueda.trim(), RETARDO_BUSQUEDA_MS);
  const { cargoId, rolId, estado } = filtros;

  const filtrosConsulta = useMemo<StaffFilters>(
    () => ({ busqueda, cargoId, rolId, estado }),
    [busqueda, cargoId, rolId, estado]
  );

  // Al cambiar los filtros volvemos a la página 1 (ajuste durante el render:
  // evita una consulta extra con la página anterior).
  const [filtrosPrevios, setFiltrosPrevios] = useState(filtrosConsulta);
  if (filtrosPrevios !== filtrosConsulta) {
    setFiltrosPrevios(filtrosConsulta);
    setPaginaActual(1);
    setMenuAbierto(null);
  }

  const cargarStaffs = useCallback(async () => {
    if (custId === null) return;

    const peticion = ++ultimaPeticion.current;
    setLoading(true);
    setError(null);

    try {
      const { data, count } = await listStaff(
        custId,
        paginaActual,
        ITEMS_POR_PAGINA,
        filtrosConsulta
      );
      if (peticion !== ultimaPeticion.current) return;

      setStaffsPagina(data);
      setTotalPaginas(Math.max(1, Math.ceil(count / ITEMS_POR_PAGINA)));
    } catch (err) {
      if (peticion !== ultimaPeticion.current) return;
      console.error("Error al cargar personales:", err);
      setError("No se pudo cargar la lista de personal.");
    } finally {
      if (peticion === ultimaPeticion.current) setLoading(false);
    }
  }, [custId, paginaActual, filtrosConsulta]);

  useEffect(() => {
    cargarStaffs();
  }, [cargarStaffs]);

  const obtenerUrlImagenStaff = (stffLinkImg: string | null) =>
    custNameBucket ? getStaffImageUrl(custNameBucket, stffLinkImg) : null;

  const actualizarActivoLocal = (stffId: number, activo: boolean) =>
    setStaffsPagina((prev) =>
      prev.map((s) => (s.stff_id === stffId ? { ...s, stff_active: activo } : s))
    );

  const toggleActivo = async (staff: StaffListItem) => {
    const nuevoEstado = !staff.stff_active;

    setError(null);
    setMenuAbierto(null);
    actualizarActivoLocal(staff.stff_id, nuevoEstado); // optimista

    try {
      await setStaffActive(staff.stff_id, nuevoEstado);
    } catch (err) {
      console.error("Error al cambiar estado del personal:", err);
      setError("No se pudo actualizar el estado. Intenta de nuevo.");
      actualizarActivoLocal(staff.stff_id, staff.stff_active); // revertir
    }
  };

  return {
    staffsPagina,
    loading,
    error,
    menuAbierto,
    setMenuAbierto,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    itemsPorPagina: ITEMS_POR_PAGINA,
    toggleActivo,
    obtenerUrlImagenStaff,
    recargar: cargarStaffs,
  };
};