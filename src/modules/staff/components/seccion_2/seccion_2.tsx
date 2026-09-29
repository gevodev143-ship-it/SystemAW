import { useEffect, useState } from "react";
import { icon } from "../../../../core/icons/";
import { useAuth } from "../../../../core/contexts/auth.context";
import { obtenerCargosPorCliente } from "../../../../core/services/job_position_customers.service";
import { obtenerRolesPorCliente } from "../../../../core/services/role_customers.service";
import type {
  EstadoFiltro,
  JobPositionCustomer,
  RoleCustomer,
  StaffFilters,
} from "../../../../core/types";
import style from "./seccion_2.module.css";

interface Seccion2Props {
  filtros: StaffFilters;
  onChange: (cambios: Partial<StaffFilters>) => void;
}


const aNumeroONull = (valor: string): number | null =>
  valor === "" ? null : Number(valor);

const Seccion_2 = ({ filtros, onChange }: Seccion2Props) => {
  const { custId } = useAuth();
  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [roles, setRoles] = useState<RoleCustomer[]>([]);

  useEffect(() => {
    if (custId === null) return;
    let activo = true;

    const cargarOpciones = async () => {
      try {
        const [cargosData, rolesData] = await Promise.all([
          obtenerCargosPorCliente(custId),
          obtenerRolesPorCliente(custId),
        ]);
        if (activo) {
          setCargos(cargosData);
          setRoles(rolesData);
        }
      } catch (err) {
        console.error("Error al cargar opciones de filtros:", err);
      }
    };

    cargarOpciones();
    return () => {
      activo = false;
    };
  }, [custId]);

  return (
    <section className={style.seccion}>
      {/* Búsqueda */}
      <div className={style.busqueda}>
        <div className={style.searchWrapper} role="search">
          <icon.iconLupa className={style.iconLupa} />
          <input
            type="search"
            placeholder="Buscar por nombre, apellido, DNI"
            aria-label="Buscar personal"
            value={filtros.busqueda}
            onChange={(e) => onChange({ busqueda: e.target.value })}
          />
        </div>
      </div>

      {/* Cargo */}
      <div className={style.filtro}>
        <label htmlFor="cargo" className={style.srOnly}>Cargo</label>
        <select
          id="cargo"
          className={style.select}
          value={filtros.cargoId ?? ""}
          onChange={(e) => onChange({ cargoId: aNumeroONull(e.target.value) })}
        >
          <option value="">Todos los cargos</option>
          {cargos.map((c) => (
            <option key={c.jb_pstn_cust_id} value={c.jb_pstn_cust_id}>
              {c.jb_pstn_cust_name}
            </option>
          ))}
        </select>
      </div>

      {/* Rol */}
      <div className={style.filtro}>
        <label htmlFor="rol" className={style.srOnly}>Rol</label>
        <select
          id="rol"
          className={style.select}
          value={filtros.rolId ?? ""}
          onChange={(e) => onChange({ rolId: aNumeroONull(e.target.value) })}
        >
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.role_cust_id} value={r.role_cust_id}>
              {r.role_cust_name}
            </option>
          ))}
        </select>
      </div>

      {/* Estado */}
      <div className={style.filtro}>
        <label htmlFor="estado" className={style.srOnly}>Estado</label>
        <select
          id="estado"
          className={style.select}
          value={filtros.estado}
          onChange={(e) => onChange({ estado: e.target.value as EstadoFiltro })}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>
      </div>
    </section>
  );
};

export default Seccion_2;