import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import style from "./modal.module.css";

interface ModalProps {
  asisId: number;
  onClose: () => void;
  onGuardado: () => void;
}

interface AsistenciaForm {
  asis_dni: string;
  asis_dato: string;
  asis_hora: string;
  asis_fecha: string;
}

const Modal = ({ asisId, onClose, onGuardado }: ModalProps) => {
  const [form, setForm] = useState<AsistenciaForm>({
    asis_dni: "",
    asis_dato: "",
    asis_hora: "",
    asis_fecha: "",
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarRegistro = async () => {
      setCargando(true);
      const { data, error } = await supabase
        .from("asistencia")
        .select("asis_dni, asis_dato, asis_hora, asis_fecha")
        .eq("asis_id", asisId)
        .single();

      if (error) {
        console.error("Error al cargar registro:", error);
        setError("No se pudo cargar el registro");
      } else if (data) {
        setForm({
          asis_dni: data.asis_dni,
          asis_dato: data.asis_dato,
          asis_hora: data.asis_hora,
          asis_fecha: data.asis_fecha,
        });
      }
      setCargando(false);
    };

    cargarRegistro();
  }, [asisId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);

    const { error } = await supabase
      .from("asistencia")
      .update({
        asis_dni: form.asis_dni,
        asis_dato: form.asis_dato,
        asis_hora: form.asis_hora,
        asis_fecha: form.asis_fecha,
      })
      .eq("asis_id", asisId);

    setGuardando(false);

    if (error) {
      console.error("Error al actualizar registro:", error);
      setError("No se pudo guardar los cambios");
      return;
    }

    onGuardado();
    onClose();
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.header}>
          <h3 className={style.titulo}>Editar registro</h3>
          <button
            className={style.cerrar}
            onClick={onClose}
            aria-label="Cerrar"
            type="button"
          >
            ×
          </button>
        </div>

        {cargando ? (
          <p className={style.mensaje}>Cargando...</p>
        ) : (
          <div className={style.cuerpo}>
            {error && <p className={style.error}>{error}</p>}

            <label className={style.campo}>
              <span>Nombre</span>
              <input
                type="text"
                name="asis_dato"
                value={form.asis_dato}
                onChange={handleChange}
              />
            </label>

            <label className={style.campo}>
              <span>DNI</span>
              <input
                type="text"
                name="asis_dni"
                value={form.asis_dni}
                onChange={handleChange}
              />
            </label>

            <label className={style.campo}>
              <span>Hora</span>
              <input
                type="time"
                name="asis_hora"
                step="1"
                value={form.asis_hora}
                onChange={handleChange}
              />
            </label>

            <label className={style.campo}>
              <span>Fecha</span>
              <input
                type="date"
                name="asis_fecha"
                value={form.asis_fecha}
                onChange={handleChange}
              />
            </label>

            <div className={style.acciones}>
              <button
                className={style.btnCancelar}
                onClick={onClose}
                type="button"
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                className={style.btnGuardar}
                onClick={handleGuardar}
                type="button"
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;