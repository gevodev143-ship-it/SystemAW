import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import style from "./sidebar.module.css";
import { supabase } from "../../../../lib/supabase";
import { icon } from "../../../../core/icons";

const Sidebar = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [canPersonalDevelopment, setCanPersonalDevelopment] = useState(false);
  const [canBusinessManagement, setCanBusinessManagement] = useState(false);

  // Controla si Gestión Empresarial está desplegado
  const [businessManagementOpen, setBusinessManagementOpen] = useState(true);

  useEffect(() => {
    const cargarPermisos = async () => {
      // 1. Verificar que haya una sesión activa
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      // 2. Buscar el customer asociado a ese usuario
      const { data: customer, error } = await supabase
        .from("customers")
        .select(
          "cust_personal_development, cust_business_management"
        )
        .eq("cust_auth_id", user.id)
        .maybeSingle();

      if (error || !customer) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      const {
        cust_personal_development,
        cust_business_management,
      } = customer;

      // 3. Si no tiene ningún modo habilitado, fuera
      if (
        !cust_personal_development &&
        !cust_business_management
      ) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      setCanPersonalDevelopment(
        !!cust_personal_development
      );

      setCanBusinessManagement(
        !!cust_business_management
      );

      setLoading(false);
    };

    cargarPermisos();
  }, [navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className={style.sidebar}>

      <section className={style.seccion1}>
        <div className={style.logo}>
          <img src="/logo.png" alt="" />
        </div>

        <div>
          <p>
            <b>System AW</b>
          </p>
        </div>
      </section>

      <section className={style.seccion2}>

        {/* ============================= */}
        {/* DESARROLLO PERSONAL */}
        {/* ============================= */}

        {canPersonalDevelopment && (
          <>
            <p>
              <b>Desarrollo Personal</b>
            </p>

            <NavLink
              to="/habits"
              className={({ isActive }) =>
                isActive
                  ? `${style.link} ${style.linkActivo}`
                  : style.link
              }
            >
              Hábitos
            </NavLink>

            <NavLink
              to="/historys"
              className={({ isActive }) =>
                isActive
                  ? `${style.link} ${style.linkActivo}`
                  : style.link
              }
            >
              Historial
            </NavLink>

            <NavLink
              to="/templates"
              className={({ isActive }) =>
                isActive
                  ? `${style.link} ${style.linkActivo}`
                  : style.link
              }
            >
              Progreso
            </NavLink>

            <NavLink
              to="/templates"
              className={({ isActive }) =>
                isActive
                  ? `${style.link} ${style.linkActivo}`
                  : style.link
              }
            >
              Métricas
            </NavLink>

            <NavLink
              to="/templates"
              className={({ isActive }) =>
                isActive
                  ? `${style.link} ${style.linkActivo}`
                  : style.link
              }
            >
              Biblioteca
            </NavLink>
          </>
        )}

        {/* ============================= */}
        {/* GESTIÓN EMPRESARIAL */}
        {/* ============================= */}

        {canBusinessManagement && (
          <>
            <p className={style.tituloSeccion}>
              <icon.iconMaleta
                className={style.iconMaleta}
              />

              <b>Gestión Empresarial</b>

              {/* SOLAMENTE LA FLECHA ES CLICKEABLE */}
              <button
                type="button"
                className={style.botonArrow}
                onClick={() =>
                  setBusinessManagementOpen(
                    !businessManagementOpen
                  )
                }
                aria-label={
                  businessManagementOpen
                    ? "Ocultar Gestión Empresarial"
                    : "Mostrar Gestión Empresarial"
                }
              >
                <icon.iconArrowDown
                  className={`${style.iconArrowDown} ${
                    businessManagementOpen
                      ? style.iconArrowDownOpen
                      : ""
                  }`}
                />
              </button>
            </p>

            {/* CONTENIDO DESPLEGABLE */}

            {businessManagementOpen && (
              <>
                <NavLink
                  to="/staffs"
                  className={({ isActive }) =>
                    isActive
                      ? `${style.link} ${style.linkActivo}`
                      : style.link
                  }
                >
                  Personal
                </NavLink>

                <NavLink
                  to="/attendances"
                  className={({ isActive }) =>
                    isActive
                      ? `${style.link} ${style.linkActivo}`
                      : style.link
                  }
                >
                  Asistencia
                </NavLink>
              </>
            )}
          </>
        )}

      </section>
    </div>
  );
};

export default Sidebar;