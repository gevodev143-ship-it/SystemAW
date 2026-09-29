import { useEffect, useState } from "react";
import style from "./modalEditarStaff.module.css";
import {
  updateStaff,
  listAllStaffByCustomer,
  obtenerCargosPorCliente,
} from "../../../services/";
import type { Staff } from "../../../types/staff.type";
import type { JobPositionCustomer } from "../../../types/job-position.type";

interface ModalEditarStaffProps {
  staff: Staff;
  custId: number;
  onClose: () => void;
  onGuardado: () => void;
}

interface FormState {
  stff_name: string;
  stff_lastname: string;
  stff_dni: string;
  stff_phone: string;
  jb_pstn_cust_id: string;
  stff_supervisor_id: string;
}

interface FormErrors {
  stff_name?: string;
  stff_lastname?: string;
  stff_dni?: string;
  stff_phone?: string;
  jb_pstn_cust_id?: string;
}

const ModalEditarStaff = ({
  staff,
  custId,
  onClose,
  onGuardado,
}: ModalEditarStaffProps) => {
  const [form, setForm] = useState<FormState>({
    stff_name: staff.stff_name,
    stff_lastname: staff.stff_lastname,
    stff_dni: staff.stff_dni,
    stff_phone: staff.stff_phone ?? "",
    jb_pstn_cust_id: String(staff.jb_pstn_cust_id),
    stff_supervisor_id: staff.stff_supervisor_id
      ? String(staff.stff_supervisor_id)
      : "",
  });

  const [errores, setErrores] = useState<FormErrors>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const [cargos, setCargos] = useState<JobPositionCustomer[]>([]);
  const [supervisores, setSupervisores] = useState<
    Pick<Staff, "stff_id" | "stff_name" | "stff_lastname">[]
  >([]);
  const [cargandoListas, setCargandoListas] = useState(true);

  useEffect(() => {
    let activo = true;

    const cargarListas = async () => {
      setCargandoListas(true);
      try {
        const [cargosData, supervisoresData] = await Promise.all([
          obtenerCargosPorCliente(custId),
          listAllStaffByCustomer(custId),
        ]);

        if (activo) {
          setCargos(cargosData);
          setSupervisores(supervisoresData);
        }
      } catch (err) {
        console.error("Error al cargar listas del formulario:", err);
        if (activo) {
          setErrorGeneral("No se pudieron cargar los cargos/personal.");
        }
      } finally {
        if (activo) setCargandoListas(false);
      }
    };

    cargarListas();

    return () => {
      activo = false;
    };
  }, [custId]);

  const manejarCambio = (
    campo: keyof FormState,
    valor: string
  ) => {
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

  const manejarGuardar = async () => {
    setErrorGeneral(null);

    if (!validar()) return;

    setGuardando(true);

    try {
      await updateStaff(staff.stff_id, {
        stff_name: form.stff_name.trim(),
        stff_lastname: form.stff_lastname.trim(),
        stff_dni: form.stff_dni,
        stff_phone: form.stff_phone.trim() === "" ? null : form.stff_phone,
        jb_pstn_cust_id: Number(form.jb_pstn_cust_id),
        stff_supervisor_id: form.stff_supervisor_id
          ? Number(form.stff_supervisor_id)
          : null,
      });

      onGuardado();
      onClose();
    } catch (err) {
      console.error("Error al actualizar personal:", err);
      setErrorGeneral("No se pudo guardar los cambios. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.encabezado}>
          <h3 className={style.titulo}>Editar personal</h3>
          <button className={style.botonCerrar} onClick={onClose}>
            ✕
          </button>
        </div>

        {errorGeneral && (
          <p className={style.errorGeneral}>{errorGeneral}</p>
        )}

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
            onChange={(e) =>
              manejarCambio("jb_pstn_cust_id", e.target.value)
            }
            disabled={cargandoListas}
          >
            <option value="">Selecciona un cargo</option>
            {cargos.map((cargo) => (
              <option
                key={cargo.jb_pstn_cust_id}
                value={cargo.jb_pstn_cust_id}
              >
                {cargo.jb_pstn_cust_name}
              </option>
            ))}
          </select>
          {errores.jb_pstn_cust_id && (
            <span className={style.errorCampo}>
              {errores.jb_pstn_cust_id}
            </span>
          )}
        </div>

        <div className={style.campo}>
          <label className={style.etiqueta}>Supervisor</label>
          <select
            className={style.input}
            value={form.stff_supervisor_id}
            onChange={(e) =>
              manejarCambio("stff_supervisor_id", e.target.value)
            }
            disabled={cargandoListas}
          >
            <option value="">Sin supervisor</option>
            {supervisores.map((s) => (
              <option key={s.stff_id} value={s.stff_id}>
                {s.stff_name} {s.stff_lastname}
              </option>
            ))}
          </select>
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
            onClick={manejarGuardar}
            disabled={guardando || cargandoListas}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarStaff;