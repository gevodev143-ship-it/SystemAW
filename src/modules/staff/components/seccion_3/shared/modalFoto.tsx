import { useEffect, useState } from "react";
import style from "./modalFoto.module.css";
import {
  obtenerAsistenciaDeHoy,
  calcularEstadoAsistencia,
  type EstadoAsistencia,
} from "../../../../../core/services/attendance.service";
import { uploadStaffImage } from "../../../../../core/services/staff.service";
import { getDefaultFotocheck } from "../../../../../core/services/fotocheck.service";
import { useAuth } from "../../../../../core/contexts/auth.context";
import type { Fotocheck } from "../../../../../core/types/fotocheck.types";
import FotocheckRender from "./FotocheckRender";

interface ModalFotoProps {
  urlImagen: string | null;
  nombreCompleto: string;
  staffId: number;
  stffName: string;
  stffLastname: string; // NUEVO: para {{staff.lastname}}
  stffCargo: string | null; // NUEVO: para {{staff.job_position}}
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
  stffLastname,
  stffCargo,
  stffDni,
  custNameBucket,
  onClose,
  onImagenSubida,
}: ModalFotoProps) => {
  const { custId } = useAuth();

  const [estado, setEstado] = useState<EstadoAsistencia | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  // undefined = cargando | null = el cliente no tiene fotocheck predeterminado
  const [fotocheck, setFotocheck] = useState<Fotocheck | null | undefined>(
    undefined
  );

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

  useEffect(() => {
    console.log("[fotocheck] custId:", custId);

    if (custId == null) {
      console.warn("[fotocheck] custId es null, se usa la vista de respaldo");
      setFotocheck(null);
      return;
    }

    let activo = true;

    getDefaultFotocheck(custId)
      .then((f) => {
        console.log("[fotocheck] resultado:", f);
        if (activo) setFotocheck(f);
      })
      .catch((err) => {
        console.error("[fotocheck] error en la consulta:", err);
        if (activo) setFotocheck(null);
      });

    return () => {
      activo = false;
    };
  }, [custId]);

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

  // -------------------------------------------------------------------------
  // VISTA 1: fotocheck predeterminado (solo el fotocheck)
  // -------------------------------------------------------------------------
    // VISTA 1: fotocheck predeterminado (solo el fotocheck)
  if (fotocheck) {
    return (
      <div className={style.overlay} onClick={onClose}>
        <div
          style={{ position: "relative" }}
          onClick={(e) => e.stopPropagation()}
        >
          <FotocheckRender
            config={fotocheck.fotocheck_config}
            variables={{
              "staff.name": stffName,
              "staff.lastname": stffLastname,
              "staff.dni": stffDni,
              "staff.job_position": stffCargo ?? "",
            }}
            fotoUrl={urlImagen}
            alturaMaxima={window.innerHeight * 0.8}
            fotoVacia={
              <label
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  fontSize: 13,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {subiendo ? "Subiendo..." : "Subir foto"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={manejarArchivoSeleccionado}
                  disabled={subiendo}
                />
              </label>
            }
          />

          {errorSubida && (
            <p
              style={{
                margin: "8px 0 0",
                padding: "4px 10px",
                borderRadius: 6,
                background: "#fff",
                color: "#b91c1c",
                fontSize: 13,
              }}
            >
              {errorSubida}
            </p>
          )}

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: -14,
              right: -14,
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "none",
              background: "#fff",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Mientras se consulta el fotocheck
  if (fotocheck === undefined) {
    return (
      <div className={style.overlay} onClick={onClose}>
        <span style={{ color: "#fff", fontSize: 14 }}>Cargando...</span>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // VISTA 2 (fallback): no hay fotocheck predeterminado -> vista original
  // -------------------------------------------------------------------------
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