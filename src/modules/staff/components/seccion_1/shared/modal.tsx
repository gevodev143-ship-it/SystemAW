import { useEffect, useId, useRef, useState } from "react";
import style from "./modal.module.css";
import { createStaff, listSupervisorCandidates, getStaffImageUrl } from "../../../../../core/services";
import { obtenerCargosPorCliente } from "../../../../../core/services/job_position_customers.service";
import type { JobPositionCustomer } from "../../../../../core/types/job-position.types";
import { useAuth } from "../../../../../core/contexts/auth.context";
import { icon } from "../../../../../core/icons";

const TEXTO_REGEX = /^\p{L}+(?:[ '’-]\p{L}+)*$/u;

interface ModalProps {
  onClose: () => void;
  onCreado: () => void;
}

interface FormState {
  stff_name: string;
  stff_lastname: string;
  stff_dni: string;
  stff_phone: string;
  jb_pstn_cust_id: string;
  stff_supervisor_id: string;
  stff_password: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const FORM_INICIAL: FormState = {
  stff_name: "",
  stff_lastname: "",
  stff_dni: "",
  stff_phone: "",
  jb_pstn_cust_id: "",
  stff_supervisor_id: "",
  stff_password: "",
};

/* ───────────── Select personalizado ───────────── */
interface Opcion {
  value: string;
  label: string;
  sublabel?: string;
  avatar?: string | null;
}

interface SelectProps {
  id: string;
  value: string;
  opciones: Opcion[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  invalido?: boolean;
  describedBy?: string;
  buscable?: boolean;
  placeholderBusqueda?: string;
}

const Avatar = ({ opcion }: { opcion: Opcion }) =>
  opcion.avatar ? (
    <img src={opcion.avatar} alt="" className={style.avatar} />
  ) : (
    <span className={`${style.avatar} ${style.avatarInicial}`}>
      {opcion.label.charAt(0).toUpperCase()}
    </span>
  );

const Select = ({
  id,
  value,
  opciones,
  placeholder,
  onChange,
  disabled,
  invalido,
  describedBy,
  buscable = false,
  placeholderBusqueda = "Buscar...",
}: SelectProps) => {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const seleccionada = opciones.find((o) => o.value === value);
  const conAvatar = opciones.some((o) => o.sublabel !== undefined);

  const texto = busqueda.trim().toLowerCase();
  const opcionesFiltradas =
    buscable && texto
      ? opciones.filter((o) => o.label.toLowerCase().includes(texto))
      : opciones;

  const cerrarMenu = () => {
    setAbierto(false);
    setBusqueda("");
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!abierto) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
        setBusqueda("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [abierto]);

  const elegir = (v: string) => {
    onChange(v);
    cerrarMenu();
  };

  return (
    <div
      className={style.select}
      ref={ref}
      onKeyDown={(e) => {
        // Escape cierra solo el dropdown, no el modal
        if (e.key === "Escape" && abierto) {
          e.stopPropagation();
          cerrarMenu();
        }
      }}
    >
      <button
        id={id}
        type="button"
        className={`${style.selectBoton} ${abierto ? style.selectAbierto : ""}`}
        onClick={() => (abierto ? cerrarMenu() : setAbierto(true))}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-invalid={invalido}
        aria-describedby={describedBy}
      >
        <span className={seleccionada ? style.selectTexto : style.selectPlaceholder}>
          {seleccionada ? seleccionada.label : placeholder}
        </span>
        <icon.iconArrowDown
          className={`${style.iconoChevron} ${abierto ? style.iconoChevronAbierto : ""}`}
        />
      </button>

      {abierto && (
        <div className={style.selectMenu}>
          {buscable && (
            <div className={style.selectBusqueda}>
              <icon.iconLupa className={style.iconoBusqueda} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={placeholderBusqueda}
                className={style.inputBusqueda}
                autoFocus
              />
            </div>
          )}

          <ul className={style.selectLista} role="listbox">
            {!texto && (
              <li
                role="option"
                aria-selected={value === ""}
                className={`${style.selectOpcion} ${style.selectOpcionPlaceholder}`}
                onClick={() => elegir("")}
              >
                {placeholder}
              </li>
            )}

            {opcionesFiltradas.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={style.selectOpcion}
                onClick={() => elegir(o.value)}
              >
                {conAvatar && <Avatar opcion={o} />}
                <span className={style.opcionTextos}>
                  <span className={style.opcionLabel}>{o.label}</span>
                  {o.sublabel && <span className={style.opcionSublabel}>({o.sublabel})</span>}
                </span>
                {o.value === value && <icon.iconCheck className={style.opcionCheck} />}
              </li>
            ))}

            {opcionesFiltradas.length === 0 && (
              <li className={style.sinResultados}>Sin resultados</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ───────────── Modal ───────────── */
const Modal = ({ onClose, onCreado }: ModalProps) => {
  const { custId, custNameBucket } = useAuth();
  const uid = useId();

  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errores, setErrores] = useState<FormErrors>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const [conAcceso, setConAcceso] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [jefes, setJefes] = useState<Opcion[]>([]);
  const [cargando, setCargando] = useState(true);

  // El correo se genera en el servidor: DNI@codigo_del_sistema.com
  const correo = form.stff_dni ? `${form.stff_dni}@(código del sistema).com` : "";

  const cerrar = () => {
    if (!guardando) onClose();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !guardando) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [guardando, onClose]);

  // Cargar cargos y posibles jefes
  useEffect(() => {
    if (custId === null) {
      setCargando(false);
      return;
    }

    let activo = true;

    const cargar = async () => {
      setCargando(true);
      try {
        const [cargosData, staffData] = await Promise.all([
          obtenerCargosPorCliente(custId),
          listSupervisorCandidates(custId),
        ]);
        if (!activo) return;
        setCargos(cargosData);
        setJefes(
          staffData.map((s) => ({
            value: String(s.stff_id),
            label: `${s.stff_name} ${s.stff_lastname}`,
            sublabel: s.job_position_customers?.jb_pstn_cust_name ?? "",
            avatar: custNameBucket ? getStaffImageUrl(custNameBucket, s.stff_link_img) : null,
          }))
        );
      } catch (err) {
        console.error("Error al cargar datos:", err);
        if (activo) setErrorGeneral("No se pudieron cargar los cargos o el personal.");
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, [custId, custNameBucket]);

  const manejarCambio = (campo: keyof FormState, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => (prev[campo] ? { ...prev, [campo]: undefined } : prev));
  };

  const alternarAcceso = (activo: boolean) => {
    setConAcceso(activo);
    if (!activo) {
      // Al desmarcar se limpia la contraseña y su error
      setVerPassword(false);
      setForm((prev) => ({ ...prev, stff_password: "" }));
      setErrores((prev) => ({ ...prev, stff_password: undefined }));
    }
  };

  const validar = (): boolean => {
    const e: FormErrors = {};
    const nombre = form.stff_name.trim();
    const apellido = form.stff_lastname.trim();

    if (!nombre) e.stff_name = "El nombre es obligatorio.";
    else if (!TEXTO_REGEX.test(nombre.replace(/\s+/g, " ")))
      e.stff_name = "El nombre solo puede contener letras.";

    if (!apellido) e.stff_lastname = "El apellido es obligatorio.";
    else if (!TEXTO_REGEX.test(apellido.replace(/\s+/g, " ")))
      e.stff_lastname = "El apellido solo puede contener letras.";

    if (!/^\d{8}$/.test(form.stff_dni)) e.stff_dni = "El DNI debe tener exactamente 8 dígitos.";
    if (form.stff_phone !== "" && !/^\d{9}$/.test(form.stff_phone))
      e.stff_phone = "El teléfono debe tener exactamente 9 dígitos.";
    if (!form.jb_pstn_cust_id) e.jb_pstn_cust_id = "Selecciona un cargo.";
    if (!form.stff_supervisor_id) e.stff_supervisor_id = "Asigna un jefe inmediato.";
    if (conAcceso && form.stff_password.length < 6)
      e.stff_password = "La contraseña debe tener al menos 6 caracteres.";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const manejarCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guardando) return;
    setErrorGeneral(null);

    if (custId === null) {
      setErrorGeneral("No se pudo identificar al cliente.");
      return;
    }
    if (!validar()) return;

    setGuardando(true);
    try {
      await createStaff({
        stff_name: form.stff_name,
        stff_lastname: form.stff_lastname,
        stff_dni: form.stff_dni,
        stff_phone: form.stff_phone === "" ? null : form.stff_phone,
        jb_pstn_cust_id: Number(form.jb_pstn_cust_id),
        stff_supervisor_id: Number(form.stff_supervisor_id),
        con_acceso: conAcceso,
        stff_password: conAcceso ? form.stff_password : undefined,
      });

      setGuardando(false);
      onCreado();
      onClose();
    } catch (err) {
      console.error("Error al crear personal:", err);
      setErrorGeneral(
        err instanceof Error && err.message
          ? err.message
          : "No se pudo crear el personal. Intenta de nuevo."
      );
      setGuardando(false);
    }
  };

  const idDe = (campo: keyof FormState) => `${uid}-${campo}`;
  const errorIdDe = (campo: keyof FormState) => `${uid}-${campo}-error`;

  const campoError = (campo: keyof FormState) =>
    errores[campo] && (
      <span id={errorIdDe(campo)} className={style.errorCampo}>
        {errores[campo]}
      </span>
    );

  const opcionesCargo: Opcion[] = cargos.map((c) => ({
    value: String(c.jb_pstn_cust_id),
    label: c.jb_pstn_cust_name,
  }));

  return (
    <div
      className={style.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) cerrar();
      }}
    >
      <form
        className={style.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-titulo`}
        onSubmit={manejarCrear}
        noValidate
      >
        <div className={style.encabezado}>
          <div>
            <h3 id={`${uid}-titulo`} className={style.titulo}>
              Registrar Nuevo Personal
            </h3>
            <p className={style.subtitulo}>
              Introduce las credenciales y asigna el puesto del trabajador.
            </p>
          </div>
          <button
            type="button"
            className={style.botonCerrar}
            onClick={cerrar}
            disabled={guardando}
            aria-label="Cerrar"
          >
            <icon.iconClose className={style.icono} />
          </button>
        </div>

        <div className={style.cuerpo}>
          {errorGeneral && (
            <p className={style.errorGeneral} role="alert">{errorGeneral}</p>
          )}
          {custId === null && (
            <p className={style.errorGeneral} role="alert">
              No se pudo identificar al cliente. Vuelve a iniciar sesión.
            </p>
          )}

          <div className={style.columnas}>
            {/* ── Izquierda: Información Personal ── */}
            <section className={style.columna}>
              <h4 className={style.seccion}>Información Personal</h4>

              <div className={style.fila}>
                <div className={style.campo}>
                  <label className={style.etiqueta} htmlFor={idDe("stff_name")}>
                    Nombre(s) <span className={style.requerido}>*</span>
                  </label>
                  <input
                    id={idDe("stff_name")}
                    className={style.input}
                    type="text"
                    placeholder="Ej. Odith Alverto"
                    autoFocus
                    value={form.stff_name}
                    onChange={(e) => manejarCambio("stff_name", e.target.value)}
                    aria-invalid={!!errores.stff_name}
                    aria-describedby={errores.stff_name ? errorIdDe("stff_name") : undefined}
                  />
                  {campoError("stff_name")}
                </div>

                <div className={style.campo}>
                  <label className={style.etiqueta} htmlFor={idDe("stff_lastname")}>
                    Apellido(s) <span className={style.requerido}>*</span>
                  </label>
                  <input
                    id={idDe("stff_lastname")}
                    className={style.input}
                    type="text"
                    placeholder="Ej. Dominguez Reymundo"
                    value={form.stff_lastname}
                    onChange={(e) => manejarCambio("stff_lastname", e.target.value)}
                    aria-invalid={!!errores.stff_lastname}
                    aria-describedby={errores.stff_lastname ? errorIdDe("stff_lastname") : undefined}
                  />
                  {campoError("stff_lastname")}
                </div>
              </div>

              <div className={style.fila}>
                <div className={style.campo}>
                  <label className={style.etiqueta} htmlFor={idDe("stff_dni")}>
                    DNI / Documento <span className={style.requerido}>*</span>
                  </label>
                  <input
                    id={idDe("stff_dni")}
                    className={style.input}
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="Número de identidad"
                    value={form.stff_dni}
                    onChange={(e) => manejarCambio("stff_dni", e.target.value.replace(/\D/g, ""))}
                    aria-invalid={!!errores.stff_dni}
                    aria-describedby={errores.stff_dni ? errorIdDe("stff_dni") : undefined}
                  />
                  {campoError("stff_dni")}
                </div>

                <div className={style.campo}>
                  <label className={style.etiqueta} htmlFor={idDe("stff_phone")}>
                    Teléfono móvil
                  </label>
                  <input
                    id={idDe("stff_phone")}
                    className={style.input}
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="Ej. 956988798"
                    value={form.stff_phone}
                    onChange={(e) => manejarCambio("stff_phone", e.target.value.replace(/\D/g, ""))}
                    aria-invalid={!!errores.stff_phone}
                    aria-describedby={errores.stff_phone ? errorIdDe("stff_phone") : undefined}
                  />
                  {campoError("stff_phone")}
                </div>
              </div>
            </section>

            {/* ── Derecha: Asignación Laboral ── */}
            <section className={`${style.columna} ${style.columnaDerecha}`}>
              <h4 className={style.seccion}>Asignación Laboral</h4>

              <div className={style.campo}>
                <label className={style.etiqueta} htmlFor={idDe("jb_pstn_cust_id")}>
                  Cargo asignado <span className={style.requerido}>*</span>
                </label>
                <Select
                  id={idDe("jb_pstn_cust_id")}
                  value={form.jb_pstn_cust_id}
                  opciones={opcionesCargo}
                  placeholder={cargando ? "Cargando cargos..." : "Selecciona un cargo"}
                  onChange={(v) => manejarCambio("jb_pstn_cust_id", v)}
                  disabled={cargando}
                  invalido={!!errores.jb_pstn_cust_id}
                  describedBy={
                    errores.jb_pstn_cust_id
                      ? errorIdDe("jb_pstn_cust_id")
                      : undefined
                  }
                  buscable
                  placeholderBusqueda="Buscar cargo..."
                />
                {campoError("jb_pstn_cust_id")}
              </div>

              <div className={style.campo}>
                <label className={style.etiqueta} htmlFor={idDe("stff_supervisor_id")}>
                  Encargado / Jefe Directo <span className={style.requerido}>*</span>
                </label>
                <Select
                  id={idDe("stff_supervisor_id")}
                  value={form.stff_supervisor_id}
                  opciones={jefes}
                  placeholder="Asignar jefe inmediato..."
                  onChange={(v) => manejarCambio("stff_supervisor_id", v)}
                  disabled={cargando}
                  invalido={!!errores.stff_supervisor_id}
                  describedBy={
                    errores.stff_supervisor_id
                      ? errorIdDe("stff_supervisor_id")
                      : undefined
                  }
                  buscable
                  placeholderBusqueda="Buscar personal..."
                />
                {campoError("stff_supervisor_id")}
              </div>
            </section>
          </div>

          {/* ── Acceso al Sistema ── */}
          <div className={style.acceso}>
            <label className={style.checkAcceso}>
              <input
                type="checkbox"
                className={style.checkbox}
                checked={conAcceso}
                onChange={(e) => alternarAcceso(e.target.checked)}
              />
              Acceso al Sistema
            </label>

            {conAcceso && (
              <div className={style.accesoCampos}>
                <div className={style.campo}>
                  <div className={style.inputConIcono}>
                    <icon.iconCorreo className={style.iconoInputIzquierdo} />

                    <input
                      className={`${style.input} ${style.inputBloqueado}`}
                      type="email"
                      value={correo}
                      placeholder="Correo electrónico"
                      aria-label="Correo electrónico"
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                </div>

                <div className={style.campo}>
                  <div className={style.inputConIcono}>
                    <icon.iconLock className={style.iconoInputIzquierdo} />

                    <input
                      id={idDe("stff_password")}
                      className={`${style.input} ${style.inputPassword}`}
                      type={verPassword ? "text" : "password"}
                      placeholder="Contraseña"
                      aria-label="Contraseña"
                      autoComplete="new-password"
                      value={form.stff_password}
                      onChange={(e) => manejarCambio("stff_password", e.target.value)}
                      aria-invalid={!!errores.stff_password}
                      aria-describedby={
                        errores.stff_password
                          ? errorIdDe("stff_password")
                          : undefined
                      }
                    />

                    <button
                      type="button"
                      className={style.botonOjo}
                      onClick={() => setVerPassword((v) => !v)}
                      aria-label={
                        verPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      aria-pressed={verPassword}
                    >
                      {verPassword ? (
                        <icon.iconEye className={style.icono} />
                      ) : (
                        <icon.iconEyeOff className={style.icono} />
                      )}
                    </button>
                  </div>
                  {campoError("stff_password")}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={style.acciones}>
          <button
            type="button"
            className={style.botonCancelar}
            onClick={cerrar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={style.botonGuardar}
            disabled={guardando || cargando || custId === null}
          >
            <icon.iconUserPlus className={style.icono} />
            {guardando ? "Guardando..." : "Crear personal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Modal;