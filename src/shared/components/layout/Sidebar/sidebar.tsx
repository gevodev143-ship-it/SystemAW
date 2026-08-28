import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import style from "./sidebar.module.css";
import { supabase } from "../../../../lib/supabase";
import { icon } from "../../../../core/icons";

interface ExtensionMenuItem {
  extns_id: number;
  extns_name: string;
}

const Sidebar = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [canPersonalDevelopment, setCanPersonalDevelopment] =
    useState(false);

  const [canBusinessManagement, setCanBusinessManagement] =
    useState(false);

  // Extensiones dinámicas del cliente logueado
  const [extensions, setExtensions] = useState<ExtensionMenuItem[]>([]);

  // Estados de los menús desplegables
  const [businessManagementOpen, setBusinessManagementOpen] =
    useState(true);

  const [extensionsOpen, setExtensionsOpen] =
    useState(false);

  const [digitalManagementOpen, setDigitalManagementOpen] =
    useState(false);

  useEffect(() => {
    const cargarPermisos = async () => {
      // 1. Verificar que haya una sesión activa
      const { data: sessionData } =
        await supabase.auth.getSession();

      const user = sessionData.session?.user;

      if (!user) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      // 2. Buscar el customer asociado al usuario (ahora también traemos cust_id)
      const { data: customer, error } = await supabase
        .from("customers")
        .select(
          "cust_id, cust_personal_development, cust_business_management"
        )
        .eq("cust_auth_id", user.id)
        .maybeSingle();

      if (error || !customer) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      const {
        cust_id,
        cust_personal_development,
        cust_business_management,
      } = customer;

      // 3. Si no tiene ningún módulo habilitado, fuera
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

      // 4. Traer las extensiones activas de este cliente
      const { data: extensionsData, error: extError } = await supabase
        .from("extensions")
        .select("extns_id, extns_name")
        .eq("cust_id", cust_id)
        .eq("extns_activa", true)
        .order("extns_name", { ascending: true });

      if (!extError && extensionsData) {
        setExtensions(extensionsData);
      }

      setLoading(false);
    };

    cargarPermisos();
  }, [navigate]);

  if (loading) {
    return null;
  }

  return (
    <div className={style.sidebar}>

      {/* ================================= */}
      {/* LOGO */}
      {/* ================================= */}

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

        {/* ================================= */}
        {/* DESARROLLO PERSONAL */}
        {/* ================================= */}

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

        {/* ================================= */}
        {/* GESTIÓN EMPRESARIAL */}
        {/* ================================= */}

        {canBusinessManagement && (
          <>
            <p className={style.tituloSeccion}>

              <icon.iconMaleta
                className={style.iconMaleta}
              />

              <b>Gestión Empresarial</b>

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
                <icon.iconUsers
                  className={style.iconGlobo}
                />
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
                <icon.iconAsistencia
                  className={style.iconGlobo}
                />
                  Asistencia
                </NavLink>
              </>
            )}
          </>
        )}

        {/* ================================= */}
        {/* EXTENSIONES */}
        {/* ================================= */}

        {(canPersonalDevelopment ||
          canBusinessManagement) && (
          <>
            <p className={style.tituloSeccion}>

              <icon.iconExtension
                className={style.iconMaleta}
              />

              <b>Extensiones</b>

              <button
                type="button"
                className={style.botonArrow}
                onClick={() =>
                  setExtensionsOpen(!extensionsOpen)
                }
                aria-label={
                  extensionsOpen
                    ? "Ocultar Extensiones"
                    : "Mostrar Extensiones"
                }
              >
                <icon.iconArrowDown
                  className={`${style.iconArrowDown} ${
                    extensionsOpen
                      ? style.iconArrowDownOpen
                      : ""
                  }`}
                />
              </button>

            </p>

            {extensionsOpen && (
              <>
                {extensions.map((ext) => (
                  <NavLink
                    key={ext.extns_id}
                    to={`/extensions/${encodeURIComponent(ext.extns_name)}`}
                    className={({ isActive }) =>
                      isActive
                        ? `${style.link} ${style.linkActivo}`
                        : style.link
                    }
                  >
                    <icon.iconExtension className={style.iconGlobo} />
                    {ext.extns_name}
                  </NavLink>
                ))}
              </>
            )}
          </>
        )}

        {/* ================================= */}
        {/* GESTIÓN DIGITAL */}
        {/* ================================= */}

        {(canPersonalDevelopment ||
          canBusinessManagement) && (
          <>
            <p className={style.tituloSeccion}>

              <icon.iconGestionDigital
                className={style.iconMaleta}
              />

              <b>Gestión Digital</b>

              <button
                type="button"
                className={style.botonArrow}
                onClick={() =>
                  setDigitalManagementOpen(
                    !digitalManagementOpen
                  )
                }
                aria-label={
                  digitalManagementOpen
                    ? "Ocultar Gestión Digital"
                    : "Mostrar Gestión Digital"
                }
              >
                <icon.iconArrowDown
                  className={`${style.iconArrowDown} ${
                    digitalManagementOpen
                      ? style.iconArrowDownOpen
                      : ""
                  }`}
                />
              </button>

            </p>

            {digitalManagementOpen && (
              <>

                <NavLink
                  to="/web"
                  className={({ isActive }) =>
                    isActive
                      ? `${style.link} ${style.linkActivo}`
                      : style.link
                  }
                >
                <icon.iconGlobo
                  className={style.iconGlobo}
                />
                  Sitio Web
                </NavLink>
                <NavLink
                  to="/mobile"
                  className={({ isActive }) =>
                    isActive
                      ? `${style.link} ${style.linkActivo}`
                      : style.link
                  }
                >
                <icon.iconMovil
                  className={style.iconGlobo}
                />
                  Aplicación Móvil
                </NavLink>

                <NavLink
                  to="/appearance"
                  className={({ isActive }) =>
                    isActive
                      ? `${style.link} ${style.linkActivo}`
                      : style.link
                  }
                >
                <icon.iconPaleta
                  className={style.iconGlobo}
                />
                  Diseño y Apariencia
                </NavLink>

                <NavLink
                  to="/configuration"
                  className={({ isActive }) =>
                    isActive
                      ? `${style.link} ${style.linkActivo}`
                      : style.link
                  }
                >
                <icon.iconConfiguracion
                  className={style.iconGlobo}
                />
                  Configuración
                </NavLink>
              </>
            )}
          </>
        )}
         {(canPersonalDevelopment ||
          canBusinessManagement) && (
          <>
            <p className={style.tituloSeccion}>
           <NavLink
                  to="/map"
                  className={style.tituloSeccion}
                  
                >
                <icon.iconMapa
                  className={style.iconMaleta}
                />
                  Mapa
                </NavLink>

            </p>
          </>
        )}

         {(canPersonalDevelopment ||
          canBusinessManagement) && (
          <>
            <p className={style.tituloSeccion}>

              <icon.iconAnuncio
                className={style.iconMaleta}
              />

              <b>Anuncio</b>
              
            </p>

       
          </>
        )}

      </section>
    </div>
  );
};

export default Sidebar;