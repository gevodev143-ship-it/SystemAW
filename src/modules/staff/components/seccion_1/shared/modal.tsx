import { useEffect, useId, useState } from "react";
import style from "../../seccion_3/shared/modalEditarStaff.module.css";
import { createStaff } from "../../../services/staff.service";
import { obtenerCargosPorCliente } from "../../../services/job_position_customers.service";
import type { JobPositionCustomer } from "../../../types/job-position.type";
import { useAuth } from "../../../../../core/contexts/auth.context";

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
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const FORM_INICIAL: FormState = {
  stff_name: "",
  stff_lastname: "",
  stff_dni: "",
  stff_phone: "",
  jb_pstn_cust_id: "",
};

const Modal = ({ onClose, onCreado }: ModalProps) => {
  const { custId } = useAuth();
  const uid = useId();

  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errores, setErrores] = useState<FormErrors>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [cargandoCargos, setCargandoCargos] = useState(true);

  const cerrar = () => {
    if (!guardando) onClose();
  };

  // Cerrar con Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !guardando) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [guardando, onClose]);

  // Cargar cargos
  useEffect(() => {
    if (custId === null) {
      setCargandoCargos(false); // evita quedar bloqueado en "cargando"
      return;
    }

    let activo = true;

    const cargarCargos = async () => {
      setCargandoCargos(true);
      try {
        const cargosData = await obtenerCargosPorCliente(custId);
        if (activo) setCargos(cargosData);
      } catch (err) {
        console.error("Error al cargar cargos:", err);
        if (activo) setErrorGeneral("No se pudieron cargar los cargos.");
      } finally {
        if (activo) setCargandoCargos(false);
      }
    };

    cargarCargos();

    return () => {
      activo = false;
    };
  }, [custId]);

  const manejarCambio = (campo: keyof FormState, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    // Limpia el error del campo al editarlo
    setErrores((prev) => (prev[campo] ? { ...prev, [campo]: undefined } : prev));
  };

  const validar = (): boolean => {
    const nuevosErrores: FormErrors = {};

    if (!form.stff_name.trim()) {
      nuevosErrores.stff_name = "El nombre es obligatorio.";
    }
    if (!form.stff_lastname.trim()) {
      nuevosErrores.stff_lastname = "El apellido es obligatorio.";
    }
    if (!/^\d{8}$/.test(form.stff_dni)) {
      nuevosErrores.stff_dni = "El DNI debe tener exactamente 8 dígitos.";
    }
    if (form.stff_phone !== "" && !/^\d{9}$/.test(form.stff_phone)) {
      nuevosErrores.stff_phone = "El teléfono debe tener exactamente 9 dígitos.";
    }
    if (!form.jb_pstn_cust_id) {
      nuevosErrores.jb_pstn_cust_id = "Selecciona un cargo.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
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
        stff_name: form.stff_name.trim(),
        stff_lastname: form.stff_lastname.trim(),
        stff_dni: form.stff_dni,
        stff_phone: form.stff_phone === "" ? null : form.stff_phone,
        stff_link_img: null,
        cust_id: custId,
        jb_pstn_cust_id: Number(form.jb_pstn_cust_id),
        role_cust_id: null,
        stff_supervisor_id: null,
        stff_active: true,
      });

      setGuardando(false);
      onCreado();
      onClose();
    } catch (err) {
      console.error("Error al crear personal:", err);
      setErrorGeneral("No se pudo crear el personal. Intenta de nuevo.");
      setGuardando(false);
    }
  };

  const idDe = (campo: keyof FormState) => `${uid}-${campo}`;
  const errorIdDe = (campo: keyof FormState) => `${uid}-${campo}-error`;

  return (
    <div
      className={style.overlay}
      // mouseDown (no click): evita cerrar al soltar el mouse tras arrastrar texto
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
          <h3 id={`${uid}-titulo`} className={style.titulo}>
            Crear personal
          </h3>
          <button
            type="button"
            className={style.botonCerrar}
            onClick={cerrar}
            disabled={guardando}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {errorGeneral && (
          <p className={style.errorGeneral} role="alert">
            {errorGeneral}
          </p>
        )}

        {custId === null && (
          <p className={style.errorGeneral} role="alert">
            No se pudo identificar al cliente. Vuelve a iniciar sesión.
          </p>
        )}

        <div className={style.campo}>
          <label className={style.etiqueta} htmlFor={idDe("stff_name")}>
            Nombre
          </label>
          <input
            id={idDe("stff_name")}
            className={style.input}
            type="text"
            autoFocus
            value={form.stff_name}
            onChange={(e) => manejarCambio("stff_name", e.target.value)}
            aria-invalid={!!errores.stff_name}
            aria-describedby={errores.stff_name ? errorIdDe("stff_name") : undefined}
          />
          {errores.stff_name && (
            <span id={errorIdDe("stff_name")} className={style.errorCampo}>
              {errores.stff_name}
            </span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta} htmlFor={idDe("stff_lastname")}>
            Apellido
          </label>
          <input
            id={idDe("stff_lastname")}
            className={style.input}
            type="text"
            value={form.stff_lastname}
            onChange={(e) => manejarCambio("stff_lastname", e.target.value)}
            aria-invalid={!!errores.stff_lastname}
            aria-describedby={
              errores.stff_lastname ? errorIdDe("stff_lastname") : undefined
            }
          />
          {errores.stff_lastname && (
            <span id={errorIdDe("stff_lastname")} className={style.errorCampo}>
              {errores.stff_lastname}
            </span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta} htmlFor={idDe("stff_dni")}>
            DNI
          </label>
          <input
            id={idDe("stff_dni")}
            className={style.input}
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={form.stff_dni}
            onChange={(e) =>
              manejarCambio("stff_dni", e.target.value.replace(/\D/g, ""))
            }
            aria-invalid={!!errores.stff_dni}
            aria-describedby={errores.stff_dni ? errorIdDe("stff_dni") : undefined}
          />
          {errores.stff_dni && (
            <span id={errorIdDe("stff_dni")} className={style.errorCampo}>
              {errores.stff_dni}
            </span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta} htmlFor={idDe("stff_phone")}>
            Teléfono
          </label>
          <input
            id={idDe("stff_phone")}
            className={style.input}
            type="text"
            inputMode="numeric"
            maxLength={9}
            value={form.stff_phone}
            onChange={(e) =>
              manejarCambio("stff_phone", e.target.value.replace(/\D/g, ""))
            }
            aria-invalid={!!errores.stff_phone}
            aria-describedby={errores.stff_phone ? errorIdDe("stff_phone") : undefined}
          />
          {errores.stff_phone && (
            <span id={errorIdDe("stff_phone")} className={style.errorCampo}>
              {errores.stff_phone}
            </span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta} htmlFor={idDe("jb_pstn_cust_id")}>
            Cargo
          </label>
          <select
            id={idDe("jb_pstn_cust_id")}
            className={style.input}
            value={form.jb_pstn_cust_id}
            onChange={(e) => manejarCambio("jb_pstn_cust_id", e.target.value)}
            disabled={cargandoCargos}
            aria-invalid={!!errores.jb_pstn_cust_id}
            aria-describedby={
              errores.jb_pstn_cust_id ? errorIdDe("jb_pstn_cust_id") : undefined
            }
          >
            <option value="">
              {cargandoCargos ? "Cargando cargos..." : "Selecciona un cargo"}
            </option>
            {cargos.map((cargo) => (
              <option key={cargo.jb_pstn_cust_id} value={cargo.jb_pstn_cust_id}>
                {cargo.jb_pstn_cust_name}
              </option>
            ))}
          </select>
          {errores.jb_pstn_cust_id && (
            <span id={errorIdDe("jb_pstn_cust_id")} className={style.errorCampo}>
              {errores.jb_pstn_cust_id}
            </span>
          )}
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
            disabled={guardando || cargandoCargos || custId === null}
          >
            {guardando ? "Guardando..." : "Crear personal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Modal;