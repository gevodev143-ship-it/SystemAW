import { useEffect, useState } from "react";
import { useAuth } from "../../../core/contexts/auth.context";
import {
  listStaff,
  activateStaff,
  deactivateStaff,
} from "../services/staff.service";
import type { Staff } from "../types/staff.type";

const ITEMS_POR_PAGINA = 7;

export const useStaffController = () => {
  const { custId } = useAuth();

  const [staffsPagina, setStaffsPagina] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargarStaffs = async (pagina: number) => {
    if (!custId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, count } = await listStaff(custId, pagina, ITEMS_POR_PAGINA);
      setStaffsPagina(data);
      setTotalPaginas(Math.max(1, Math.ceil(count / ITEMS_POR_PAGINA)));
    } catch (err) {
      console.error("Error al cargar personales:", err);
      setError("No se pudo cargar la lista de personal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarStaffs(paginaActual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custId, paginaActual]);

  const toggleActivo = async (staff: Staff) => {
    const nuevoEstado = !staff.stff_active;

    // Actualización optimista
    setStaffsPagina((prev) =>
      prev.map((s) =>
        s.stff_id === staff.stff_id ? { ...s, stff_active: nuevoEstado } : s
      )
    );
    setMenuAbierto(null);

    try {
      if (nuevoEstado) {
        await activateStaff(staff.stff_id);
      } else {
        await deactivateStaff(staff.stff_id);
      }
    } catch (err) {
      console.error("Error al cambiar estado del personal:", err);
      setError("No se pudo actualizar el estado. Intenta de nuevo.");
      // revertimos el cambio optimista
      setStaffsPagina((prev) =>
        prev.map((s) =>
          s.stff_id === staff.stff_id
            ? { ...s, stff_active: staff.stff_active }
            : s
        )
      );
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
    recargar: () => cargarStaffs(paginaActual),
  };
};