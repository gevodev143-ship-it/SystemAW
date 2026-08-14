import { NavLink } from "react-router-dom";
import style from "./sidebar.module.css";

const Sidebar = () => {
  return (
    <div className={style.sidebar}>

      <section className={style.seccion1}>
        <div className={style.logo}><img src="/logo.png" alt="" /></div>
      </section>

      <section className={style.seccion2}>
        <p><b>Información Personal</b></p>

        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Inicio
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Lista de usuarios
        </NavLink>

        <NavLink
          to="/attendances"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Asistencia
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Plantilla
        </NavLink>

        <p><b>Almacen</b></p>
        <NavLink
          to="/catalog"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Catalogo
        </NavLink>

      </section>

    </div>
  );
};

export default Sidebar;