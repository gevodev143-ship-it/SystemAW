import { NavLink } from "react-router-dom";
import style from "./sidebar.module.css";

const Sidebar = () => {
  return (
    <div className={style.sidebar}>

      <section className={style.seccion1}>
        <div className={style.logo}><img src="/logo.png" alt="" /></div>
        <div><p><b>System AW</b></p></div>
        
      </section>

      <section className={style.seccion2}>
        <p><b>Desarrollo Personal</b></p>

        <NavLink
          to="/habits"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Hábitos
        </NavLink>

        <NavLink
          to="/historys"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Historial
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Progreso
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Métricas
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Documentos
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Biblioteca
        </NavLink>

        <p><b>Gestión Empresarial</b></p>
        <NavLink
          to="/attendances"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Asistencia
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Personal
        </NavLink>
        <NavLink
          to="/catalogs"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Catalogos
        </NavLink>
        
        <p><b>Gestión Web</b></p>      
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Banners
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) =>
            isActive ? `${style.link} ${style.linkActivo}` : style.link
          }
        >
          Anuncios
        </NavLink>

      </section>

    </div>
  );
};

export default Sidebar;