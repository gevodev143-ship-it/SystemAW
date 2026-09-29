import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import style from "./modal.module.css";
import { supabase } from "../../../../../lib/supabase";
import type { JobPositionCustomer } from "../../../../../core/types";

export type ModoModal = "crear" | "editar" | "eliminar";

interface ModalProps {
  modo: ModoModal;
  custId: number;
  /** Requerido en "editar" y "eliminar" */
  cargo: JobPositionCustomer | null;
  onClose: () => void;
  /** Se llama después de completar la acción correctamente */
  onGuardado: () => void;
}

const TABLA = "job_position_customers";

const TITULOS: Record<ModoModal, string> = {
  crear: "Crear Cargo",
  editar: "Editar Cargo",
  eliminar: "Eliminar Cargo",
};

const Modal = ({ modo, custId, cargo, onClose, onGuardado }: ModalProps) => {
  const [nombre, setNombre] = useState(cargo?.jb_pstn_cust_name ?? "");
  const [descripcion, setDescripcion] = useState(
    cargo?.jb_pstn_cust_description ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Escape para cerrar + bloquear scroll del fondo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose, saving]);

  // ---------------------------------------------------------
  // Operaciones en Supabase
  // ---------------------------------------------------------
  const ejecutar = async () => {
    if (modo === "eliminar") {
      return supabase
        .from(TABLA)
        .delete()
        .eq("jb_pstn_cust_id", cargo!.jb_pstn_cust_id)
        .eq("cust_id", custId);
    }

    const payload = {
      jb_pstn_cust_name: nombre.trim(),
      jb_pstn_cust_description: descripcion.trim() || null,
    };

    if (modo === "editar") {
      return supabase
        .from(TABLA)
        .update(payload)
        .eq("jb_pstn_cust_id", cargo!.jb_pstn_cust_id)
        .eq("cust_id", custId);
    }

    return supabase.from(TABLA).insert({ ...payload, cust_id: custId });
  };

  const mensajeError = (code?: string) => {
    if (code === "23505") return "Ya existe un cargo con ese nombre.";
    if (code === "23503")
      return "No se puede eliminar: el cargo está en uso por algún trabajador.";
    return `No se pudo ${
      modo === "eliminar" ? "eliminar" : modo === "editar" ? "actualizar" : "crear"
    } el cargo.`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (modo !== "eliminar" && !nombre.trim()) {
      setError("El nombre del cargo es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await ejecutar();

    setSaving(false);

    if (error) {
      console.error(`ERROR AL ${modo.toUpperCase()} CARGO:`, error);
      setError(mensajeError(error.code));
      return;
    }

    onGuardado();
  };

  const eliminando = modo === "eliminar";

  return createPortal(
    <div
      className={style.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <form
        className={style.contenido}
        role="dialog"
        aria-modal="true"
        aria-label={TITULOS[modo]}
        onSubmit={handleSubmit}
      >
        <h3 className={style.titulo}>{TITULOS[modo]}</h3>

        <div className={style.cuerpo}>
          {eliminando ? (
            <p className={style.mensaje}>
              ¿Seguro que deseas eliminar el cargo{" "}
              <b>"{cargo?.jb_pstn_cust_name}"</b>? Esta acción no se puede
              deshacer.
            </p>
          ) : (
            <>
              <label className={style.label} htmlFor="cargo-nombre">
                Nombre
              </label>
              <input
                id="cargo-nombre"
                className={style.input}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Administrador"
                autoFocus
              />

              <label className={style.label} htmlFor="cargo-descripcion">
                Descripción
              </label>
              <textarea
                id="cargo-descripcion"
                className={style.textarea}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe las funciones del cargo..."
              />
            </>
          )}

          {error && <span className={style.textoError}>{error}</span>}
        </div>

        <div className={style.acciones}>
          <button
            type="button"
            className={style.botonSecundario}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={eliminando ? style.botonPeligro : style.boton}
            disabled={saving}
          >
            {saving
              ? "Guardando..."
              : eliminando
              ? "Eliminar"
              : "Guardar"}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default Modal;