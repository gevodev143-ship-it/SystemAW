import { useEffect, useState } from "react";
import style from "./modalFoto.module.css";
import {
  obtenerAsistenciaDeHoy,
  calcularEstadoAsistencia,
  type EstadoAsistencia,
} from "../../../../../core/services/attendance.service";
import {
  uploadStaffImage,
} from "../../../services/staff.service";

interface ModalFotoProps {
  urlImagen: string | null;
  nombreCompleto: string;
  staffId: number;
  stffName: string;
  stffDni: string;
  custNameBucket: string;
  onClose: () => void;
  onImagenSubida: (nuevoLinkImg: string) => void;
}

const CLASE_POR_ESTADO: Record<EstadoAsistencia, string> = {
  "Sin registro": "badgeSinRegistro",
  "En jornada": "badgeEnJornada",
  "En descanso": "badgeEnDescanso",
  "Fuera de jornada": "badgeFueraDeJornada",
};

const ModalFoto = ({
  urlImagen,
  nombreCompleto,
  staffId,
  stffName,
  stffDni,
  custNameBucket,
  onClose,
  onImagenSubida,
}: ModalFotoProps) => {
  const [estado, setEstado] = useState<EstadoAsistencia | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargarEstado = async () => {
      setEstado(null);
      const asistencia = await obtenerAsistenciaDeHoy(staffId);
      if (activo) {
        setEstado(calcularEstadoAsistencia(asistencia));
      }
    };

    cargarEstado();

    return () => {
      activo = false;
    };
  }, [staffId]);

  const manejarArchivoSeleccionado = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo si falla

    if (!archivo) return;

    setSubiendo(true);
    setErrorSubida(null);

    try {
      const nombreArchivo = await uploadStaffImage(
        custNameBucket,
        staffId,
        stffName,
        stffDni,
        archivo
      );
      onImagenSubida(nombreArchivo);
    } catch (err) {
      console.error("Error al subir la imagen:", err);
      setErrorSubida("No se pudo subir la imagen. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  };

  const claseEstado = estado ? style[CLASE_POR_ESTADO[estado]] : style.badgeCargando;

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <div className={style.marco}>
          {urlImagen ? (
            <img src={urlImagen} alt={nombreCompleto} className={style.foto} />
          ) : (
            <label className={style.zonaSubida}>
              <span className={style.sinFoto}>
                {subiendo ? "Subiendo..." : "Sin foto"}
              </span>
              <div className={style.overlaySubir}>
                {subiendo ? "Subiendo..." : "Subir imagen"}
              </div>
              <input
                type="file"
                accept="image/*"
                className={style.inputArchivo}
                onChange={manejarArchivoSeleccionado}
                disabled={subiendo}
              />
            </label>
          )}
        </div>

        <div className={style.derecha}>
          <h3 className={style.nombre}>{nombreCompleto}</h3>
          <span className={`${style.estado} ${claseEstado}`}>
            {estado ?? "Cargando..."}
          </span>
          {errorSubida && <p className={style.errorSubida}>{errorSubida}</p>}
        </div>

        <button className={style.botonCerrar} onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default ModalFoto;