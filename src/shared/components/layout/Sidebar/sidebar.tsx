import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import style from "./sidebar.module.css";
import { supabase } from "../../../../lib/supabase";
import { icon } from "../../../../core/icons";

interface ExtensionMenuItem {
  extns_id: number;
  extns_name: string;
}

// Clase compartida para todos los NavLink
const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${style.link} ${style.linkActivo}` : style.link;

type CollapsibleProps = {
  id: string;
  title: string;
  icon: ReactNode;
  open: boolean;
  onToggle: () => void;
  nested?: boolean; // true = sección dentro de un módulo (ej. Personal)
  collapsed?: boolean; // true = sidebar colapsado (solo iconos)
  children: ReactNode;
};

const Collapsible = ({
  id,
  title,
  icon: sectionIcon,
  open,
  onToggle,
  nested = false,
  collapsed = false,
  children,
}: CollapsibleProps) => {
  const headerClass = nested
    ? `${style.tituloNested} ${style.tituloClickable}`
    : `${style.tituloSeccion} ${style.tituloClickable}`;

  const headerProps = {
    className: headerClass,
    role: "button",
    tabIndex: 0,
    title: collapsed ? title : undefined, // tooltip al colapsar
    "aria-expanded": open,
    "aria-controls": id,
    onClick: onToggle,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
  };

  const content = (
    <>
      {sectionIcon}
      {nested ? <span>{title}</span> : <b className={style.label}>{title}</b>}
      <span className={style.botonArrow} aria-hidden="true">
        <icon.iconArrowDown
          className={`${style.iconArrowDown} ${
            open ? style.iconArrowDownOpen : ""
          }`}
        />
      </span>
    </>
  );

  return (
    <>
      {/* Los módulos usan <p> (estilo de título); las secciones usan <div> (estilo de link) */}
      {nested ? (
        <div {...headerProps}>{content}</div>
      ) : (
        <p {...headerProps}>{content}</p>
      )}

      <div
        id={id}
        className={`${style.submenu} ${open ? style.submenuOpen : ""}`}
      >
        <div className={style.submenuInner}>{children}</div>
      </div>
    </>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [canPersonalDevelopment, setCanPersonalDevelopment] = useState(false);
  const [canBusinessManagement, setCanBusinessManagement] = useState(false);
  const [canDigitalManagement, setCanDigitalManagement] = useState(false);

  const [extensions, setExtensions] = useState<ExtensionMenuItem[]>([]);

  const [businessManagementOpen, setBusinessManagementOpen] = useState(true);
  const [extensionsOpen, setExtensionsOpen] = useState(false);
  const [digitalManagementOpen, setDigitalManagementOpen] = useState(false);

  const [personalOpen, setPersonalOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  // Si está colapsado, al pulsar un módulo se expande y se abre ese módulo
  const toggleModulo =
    (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
      if (collapsed) {
        setCollapsed(false);
        setter(true);
      } else {
        setter((v) => !v);
      }
    };

  useEffect(() => {
    const cargarPermisos = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("cust_id")
        .eq("cust_auth_id", user.id)
        .maybeSingle();

      if (customerError || !customer) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      const { cust_id } = customer;

      const { data: custModules, error: modulesError } = await supabase
        .from("customer_modules")
        .select("mod_id, modules(mod_name, mod_is_active)")
        .eq("cust_id", cust_id)
        .eq("cust_mod_is_active", true);

      if (modulesError || !custModules || custModules.length === 0) {
        localStorage.removeItem("aw_erp_jwt");
        navigate("/login");
        return;
      }

      const nombresModulos = custModules
        .filter((cm: any) => cm.modules?.mod_is_active !== false)
        .map((cm: any) => cm.modules?.mod_name)
        .filter(Boolean);

      setCanPersonalDevelopment(nombresModulos.includes("Desarrollo Personal"));
      setCanBusinessManagement(nombresModulos.includes("Gestión Empresarial"));
      setCanDigitalManagement(nombresModulos.includes("Gestión Digital"));

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

  const tieneAlgunModulo =
    canPersonalDevelopment || canBusinessManagement || canDigitalManagement;

  return (
    <div className={`${style.sidebar} ${collapsed ? style.collapsed : ""}`}>
      {/* CABECERA */}
      <section className={style.seccion1}>
        {collapsed ? (
          <>
            <div className={style.logo}>
              <img src="/logo.png" alt="System AW" />
            </div>
            <button
              type="button"
              className={style.botonIcono}
              onClick={() => setCollapsed(false)}
              aria-label="Expandir menú"
            >
              <icon.iconPanelDistribution className={style.iconAccion} />
            </button>
          </>
        ) : (
          <>
            <span className={style.nombre}>System AW</span>
            <div className={style.acciones}>
              <button
                type="button"
                className={style.botonIcono}
                aria-label="Buscar"
              >
                <icon.iconLupa className={style.iconAccion} />
              </button>
              <button
                type="button"
                className={style.botonIcono}
                onClick={() => setCollapsed(true)}
                aria-label="Colapsar menú"
              >
                <icon.iconPanelDistribution className={style.iconAccion} />
              </button>
            </div>
          </>
        )}
      </section>

      <section className={style.seccion2}>
        {/* DESARROLLO PERSONAL (sin icono propio: uso uno provisional al colapsar) */}
        {canPersonalDevelopment &&
          (collapsed ? (
            <p
              className={`${style.tituloSeccion} ${style.tituloClickable}`}
              title="Desarrollo Personal"
              onClick={() => setCollapsed(false)}
            >
              <icon.iconUser className={style.iconMaleta} />
            </p>
          ) : (
            <>
              <p>
                <b>Desarrollo Personal</b>
              </p>

              <NavLink to="/habits" className={navClass}>
                Hábitos
              </NavLink>
              <NavLink to="/historys" className={navClass}>
                Historial
              </NavLink>
              {/* OJO: estas 3 apuntan a la misma ruta, se activan a la vez */}
              <NavLink to="/templates" className={navClass}>
                Progreso
              </NavLink>
              <NavLink to="/templates" className={navClass}>
                Métricas
              </NavLink>
              <NavLink to="/templates" className={navClass}>
                Biblioteca
              </NavLink>
            </>
          ))}

        {/* MÓDULO: GESTIÓN EMPRESARIAL */}
        {canBusinessManagement && (
          <Collapsible
            id="submenu-empresarial"
            title="Gestión Empresarial"
            icon={<icon.iconMaleta className={style.iconMaleta} />}
            open={businessManagementOpen}
            onToggle={toggleModulo(setBusinessManagementOpen)}
            collapsed={collapsed}
          >
            {/* SECCIÓN: PERSONAL */}
            <Collapsible
              nested
              id="submenu-personal"
              title="Personal"
              icon={<icon.iconUsers className={style.iconSub} />}
              open={personalOpen}
              onToggle={() => setPersonalOpen((v) => !v)}
            >
              <NavLink to="/staffs" className={navClass}>
                <icon.iconUsers className={style.iconSub} />
                Lista de personal
              </NavLink>
              <NavLink to="/organizational-chart" className={navClass}>
                <icon.iconOrganigrama className={style.iconSub} />
                Organigrama
              </NavLink>
              <NavLink to="/job-position" className={navClass}>
                <icon.iconUser className={style.iconSub} />
                Cargo
              </NavLink>
              <NavLink to="/roles" className={navClass}>
                <icon.iconRol className={style.iconSub} />
                Rol
              </NavLink>
            </Collapsible>

            {/* SECCIÓN: ASISTENCIA */}
            <NavLink to="/attendances" className={navClass}>
              <icon.iconAsistencia className={style.iconSub} />
              Asistencia
            </NavLink>

            {/* SECCIÓN: ALMACENAMIENTO */}
            <NavLink to="/logos" className={navClass}>
              <icon.iconCarpeta className={style.iconSub} />
              Almacenamiento
            </NavLink>
          </Collapsible>
        )}

        {/* EXTENSIONES */}
        {tieneAlgunModulo && extensions.length > 0 && (
          <Collapsible
            id="submenu-extensiones"
            title="Extensiones"
            icon={<icon.iconExtension className={style.iconMaleta} />}
            open={extensionsOpen}
            onToggle={toggleModulo(setExtensionsOpen)}
            collapsed={collapsed}
          >
            {extensions.map((ext) => (
              <NavLink
                key={ext.extns_id}
                to={`/extensions/${encodeURIComponent(ext.extns_name)}`}
                className={navClass}
              >
                <icon.iconExtension className={style.iconSub} />
                {ext.extns_name}
              </NavLink>
            ))}
          </Collapsible>
        )}

        {/* GESTIÓN DIGITAL */}
        {canDigitalManagement && (
          <Collapsible
            id="submenu-digital"
            title="Gestión Digital"
            icon={<icon.iconGestionDigital className={style.iconMaleta} />}
            open={digitalManagementOpen}
            onToggle={toggleModulo(setDigitalManagementOpen)}
            collapsed={collapsed}
          >
            <NavLink to="/web" className={navClass}>
              <icon.iconGlobo className={style.iconSub} />
              Sitio Web
            </NavLink>
            <NavLink to="/mobile" className={navClass}>
              <icon.iconMovil className={style.iconSub} />
              Aplicación Móvil
            </NavLink>
            <NavLink to="/appearance" className={navClass}>
              <icon.iconPaleta className={style.iconSub} />
              Diseño y Apariencia
            </NavLink>
            <NavLink to="/configuration" className={navClass}>
              <icon.iconConfiguracion className={style.iconSub} />
              Configuración
            </NavLink>
          </Collapsible>
        )}

        {/* MAPA */}
        {tieneAlgunModulo && (
          <p className={style.tituloSeccion}>
            <NavLink to="/map" className={style.tituloSeccion} title="Mapa">
              <icon.iconMapa className={style.iconMaleta} />
              <span className={style.label}>Mapa</span>
            </NavLink>
          </p>
        )}

        {/* ANUNCIO */}
        {tieneAlgunModulo && (
          <p className={style.tituloSeccion} title="Anuncio">
            <icon.iconAnuncio className={style.iconMaleta} />
            <b className={style.label}>Anuncio</b>
          </p>
        )}

        {/* CONFIGURACIÓN */}
        {tieneAlgunModulo && (
          <p className={style.tituloSeccion} title="Configuración">
            <icon.iconConfiguracion className={style.iconMaleta} />
            <b className={style.label}>Configuración</b>
          </p>
        )}
      </section>
    </div>
  );
};

export default Sidebar;