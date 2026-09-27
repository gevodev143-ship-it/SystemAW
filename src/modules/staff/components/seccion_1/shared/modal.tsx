import { useEffect, useState } from "react";
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

interface FormErrors {
  stff_name?: string;
  stff_lastname?: string;
  stff_dni?: string;
  stff_phone?: string;
  jb_pstn_cust_id?: string;
}

const Modal = ({ onClose, onCreado }: ModalProps) => {
  const { custId } = useAuth();

  const [form, setForm] = useState<FormState>({
    stff_name: "",
    stff_lastname: "",
    stff_dni: "",
    stff_phone: "",
    jb_pstn_cust_id: "",
  });

  const [errores, setErrores] = useState<FormErrors>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [cargandoCargos, setCargandoCargos] = useState(true);

  useEffect(() => {
    if (custId === null) return;

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

    if (form.stff_phone.trim() !== "" && !/^\d{9}$/.test(form.stff_phone)) {
      nuevosErrores.stff_phone = "El teléfono debe tener exactamente 9 dígitos.";
    }

    if (!form.jb_pstn_cust_id) {
      nuevosErrores.jb_pstn_cust_id = "Selecciona un cargo.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarCrear = async () => {
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
        stff_phone: form.stff_phone.trim() === "" ? null : form.stff_phone,
        stff_link_img: null,
        cust_id: custId,
        jb_pstn_cust_id: Number(form.jb_pstn_cust_id),
        role_cust_id: null,
        stff_supervisor_id: null,
        stff_active: true,
      });

      onCreado();
      onClose();
    } catch (err) {
      console.error("Error al crear personal:", err);
      setErrorGeneral("No se pudo crear el personal. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.encabezado}>
          <h3 className={style.titulo}>Crear personal</h3>
          <button className={style.botonCerrar} onClick={onClose}>
            ✕
          </button>
        </div>

        {errorGeneral && <p className={style.errorGeneral}>{errorGeneral}</p>}

        <div className={style.campo}>
          <label className={style.etiqueta}>Nombre</label>
          <input
            className={style.input}
            type="text"
            value={form.stff_name}
            onChange={(e) => manejarCambio("stff_name", e.target.value)}
          />
          {errores.stff_name && (
            <span className={style.errorCampo}>{errores.stff_name}</span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta}>Apellido</label>
          <input
            className={style.input}
            type="text"
            value={form.stff_lastname}
            onChange={(e) => manejarCambio("stff_lastname", e.target.value)}
          />
          {errores.stff_lastname && (
            <span className={style.errorCampo}>{errores.stff_lastname}</span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta}>DNI</label>
          <input
            className={style.input}
            type="text"
            inputMode="numeric"
            maxLength={8}
            value={form.stff_dni}
            onChange={(e) =>
              manejarCambio("stff_dni", e.target.value.replace(/\D/g, ""))
            }
          />
          {errores.stff_dni && (
            <span className={style.errorCampo}>{errores.stff_dni}</span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta}>Teléfono</label>
          <input
            className={style.input}
            type="text"
            inputMode="numeric"
            maxLength={9}
            value={form.stff_phone}
            onChange={(e) =>
              manejarCambio("stff_phone", e.target.value.replace(/\D/g, ""))
            }
          />
          {errores.stff_phone && (
            <span className={style.errorCampo}>{errores.stff_phone}</span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta}>Cargo</label>
          <select
            className={style.input}
            value={form.jb_pstn_cust_id}
            onChange={(e) => manejarCambio("jb_pstn_cust_id", e.target.value)}
            disabled={cargandoCargos}
          >
            <option value="">Selecciona un cargo</option>
            {cargos.map((cargo) => (
              <option key={cargo.jb_pstn_cust_id} value={cargo.jb_pstn_cust_id}>
                {cargo.jb_pstn_cust_name}
              </option>
            ))}
          </select>
          {errores.jb_pstn_cust_id && (
            <span className={style.errorCampo}>{errores.jb_pstn_cust_id}</span>
          )}
        </div>

        <div className={style.acciones}>
          <button
            className={style.botonCancelar}
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            className={style.botonGuardar}
            onClick={manejarCrear}
            disabled={guardando || cargandoCargos}
          >
            {guardando ? "Guardando..." : "Crear personal"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;