import { useState } from "react";
import style from "./modal_reporte.module.css";
import { generarReporteAsistencia } from "./generarReporteAsistencia";

interface ModalReporteProps {
  onClose: () => void;
}

const ModalReporte = ({ onClose }: ModalReporteProps) => {
  const [dni, setDni] = useState("");
  const [generando, setGenerando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCrearExcel = async () => {
    setErrorMsg(null);

    if (!dni.trim()) {
      setErrorMsg("Ingresa un DNI");
      return;
    }

    setGenerando(true);
    try {
      await generarReporteAsistencia(dni);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Ocurrió un error al generar el reporte");
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.header}>
          <h3>Hacer reporte de asistencia</h3>
          <button type="button" className={style.cerrar} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={style.cuerpo}>
          <label className={style.label} htmlFor="dniReporte">
            DNI del trabajador
          </label>
          <input
            id="dniReporte"
            type="text"
            className={style.input}
            placeholder="Ej. 76978140"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            disabled={generando}
          />

          {errorMsg && <p className={style.error}>{errorMsg}</p>}
        </div>

        <div className={style.pie}>
          <button
            type="button"
            className={style.btnCrear}
            onClick={handleCrearExcel}
            disabled={generando}
          >
            {generando ? "Generando..." : "Crear excel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalReporte;