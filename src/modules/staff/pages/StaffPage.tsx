import { useState } from "react";
import style from "./StaffPage.module.css";
import Seccion_1 from "../components/seccion_1/seccion_1";
import Seccion_2 from "../components/seccion_2/seccion_2";
import Seccion_3 from "../components/seccion_3/seccion_3";
import type { StaffFilters } from "../../../core/types";
import { FILTROS_STAFF_INICIALES } from "../controllers/staff.controller";

export default function StaffPage() {
  const [filtros, setFiltros] = useState<StaffFilters>(FILTROS_STAFF_INICIALES);

  const actualizarFiltros = (cambios: Partial<StaffFilters>) =>
    setFiltros((prev) => ({ ...prev, ...cambios }));

  return (
    <div className={style.page}>
      <Seccion_1 />
      <Seccion_2 filtros={filtros} onChange={actualizarFiltros} />
      <Seccion_3 filtros={filtros} />
    </div>
  );
}