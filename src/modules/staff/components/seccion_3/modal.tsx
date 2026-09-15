import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import style from "./modal.module.css";

interface ModalStaffProps {
  stff_name: string;
  stff_lastname: string;
  stff_dni: string;
  stff_link_img: string | null;
  cargo: string; // job_position_customers.jb_pstn_cust_name
}

interface Props {
  staff: ModalStaffProps;
  onClose: () => void;
}

const Modal = ({ staff, onClose }: Props) => {
  const [vista, setVista] = useState<"imagen" | "fotocheck">("imagen");
  const fotocheckRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);

  const qrData = JSON.stringify({
    nombre: staff.stff_name,
    apellido: staff.stff_lastname,
    dni: staff.stff_dni,
    cargo: staff.cargo,
  });

  const handleDescargarFotocheck = async () => {
    if (!fotocheckRef.current) return;
    setDescargando(true);
    try {
      const canvas = await html2canvas(fotocheckRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
      });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `fotocheck_${staff.stff_dni}.png`;
      link.click();
    } catch (err) {
      console.error("ERROR AL DESCARGAR FOTOCHECK:", err);
      alert("No se pudo descargar el fotocheck.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.cuadro} onClick={(e) => e.stopPropagation()}>
        <button className={style.cerrar} onClick={onClose}>
          ✕
        </button>

        <div className={style.contenido}>
          {/* IZQUIERDA: imagen o fotocheck */}
          <div className={style.zonaIzquierda}>
            {vista === "imagen" ? (
              staff.stff_link_img ? (
                <img
                  src={staff.stff_link_img}
                  alt={`${staff.stff_name} ${staff.stff_lastname}`}
                  className={style.imagenGrande}
                />
              ) : (
                <div className={style.imagenVacia}>Sin imagen</div>
              )
            ) : (
              <div ref={fotocheckRef} className={style.fotocheck}>
                <p className={style.fotocheckTitulo}>FOTOCHECK</p>
                {staff.stff_link_img ? (
                  <img
                    src={staff.stff_link_img}
                    alt={`${staff.stff_name} ${staff.stff_lastname}`}
                    className={style.fotocheckImg}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className={style.fotocheckImgVacia}>Sin imagen</div>
                )}
                <p className={style.fotocheckNombre}>
                  {staff.stff_name} {staff.stff_lastname}
                </p>
                <p className={style.fotocheckCargo}>{staff.cargo}</p>
                <div className={style.fotocheckQr}>
                  <QRCode value={qrData} size={110} />
                </div>
                <p className={style.fotocheckDni}>DNI: {staff.stff_dni}</p>
              </div>
            )}
          </div>

          {/* DERECHA: botones */}
          <div className={style.zonaDerecha}>
            <button
              className={vista === "imagen" ? style.botonActivo : style.boton}
              onClick={() => setVista("imagen")}
            >
              Mostrar Imagen
            </button>
            <button
              className={vista === "fotocheck" ? style.botonActivo : style.boton}
              onClick={() => setVista("fotocheck")}
            >
              Mostrar Fotocheck
            </button>

            {vista === "fotocheck" && (
              <button
                className={style.botonDescargar}
                onClick={handleDescargarFotocheck}
                disabled={descargando}
              >
                {descargando ? "Descargando..." : "Descargar Fotocheck"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;