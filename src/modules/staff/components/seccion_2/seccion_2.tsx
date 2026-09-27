import { icon } from "../../../../core/icons/";
import style from "./seccion_2.module.css";

const Seccion_2 = () => {
  return (
    <section className={style.seccion}>

      {/* Búsqueda */}
      <div className={style.busqueda}>
        <search className={style.searchWrapper}>
          <icon.iconLupa className={style.iconLupa}/>
          <input
            type="search"
            placeholder="Buscar por nombre, apellido, DNI"
            aria-label="Buscar personal"
          />
        </search>
      </div>

      {/* Filtro por cargo */}
      <div className={style.filtro}>
        <label htmlFor="cargo" className={style.srOnly}>Cargo</label>

        <select id="cargo" className={style.selectCargo}>
          <option value="">Todos los cargos</option>
        </select>
      </div>

    </section>
  );
};

export default Seccion_2;