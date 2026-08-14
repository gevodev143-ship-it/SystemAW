import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import style from "./fotocheck.module.css";
import { images } from "../../../../assets/img";

interface FotocheckProps {
  nombre: string;
  apellido: string;
  cargo: string;
  codigo: string;
  sede: string;
  foto: string | null; // dataURL de la imagen subida
  qrData: string;
}

const Fotocheck = forwardRef<HTMLDivElement, FotocheckProps>(
  ({ nombre, apellido, cargo, codigo, sede, foto, qrData }, ref) => {
    return (
      <div ref={ref} className={style.fotocheck}>
        {/* Div 1: logo, sede/tienda/codigo/planilla (izq) + foto (der) */}
        <div className={style.topSection}>
          <div className={style.topRow}>
            <div className={style.infoLeft}>
              <div className={style.infoBlock}>
                <img
                  src={images.logoGorrioncito}
                  alt="Ferretería Gorrioncito"
                  className={style.logoHeader}
                />

                <hr />
                <p className={style.label}>Sede</p>
                <p className={style.sede}>{sede}</p>
                <p className={style.label}>Tienda</p>
              </div>

              <hr />

              <div className={style.infoBlock}>
                <p className={style.label}>Codigo</p>
                <p className={style.codigo}>{codigo}</p>
              </div>

              <hr />

              <p className={style.label}>Planilla</p>
            </div>

            <div className={style.infoRight}>
              {foto && (
                <img src={foto} alt="Foto trabajador" className={style.foto} />
              )}
            </div>
          </div>
        </div>

        {/* Div 2: nombre, apellido y cargo */}
        <div className={style.nameSection}>
          <h1 className={style.nombre}>{nombre}</h1>
          <h2 className={style.nombre}>{apellido}</h2>
          <p className={style.cargo}>
            {cargo.split(" ").map((palabra, i) => (
              <span key={i} className={style.cargoLinea}>
                {palabra}
              </span>
            ))}
          </p>
        </div>

        {/* Div 3: qr (izq) + mascota (der) */}
        <div className={style.footer}>
          <div className={style.footerLeft}>
            <div className={style.qr}>
              <QRCodeCanvas
                value={qrData}
                size={140}
                level="M"
                bgColor="#2258e0"
                fgColor="#ffffff"
              />
            </div>
          </div>

          <div className={style.footerRight}>
            <img
              src={images.logoMascota}
              alt="Gorrioncito"
              className={style.logoFooter}
            />
          </div>
        </div>
      </div>
    );
  }
);

Fotocheck.displayName = "Fotocheck";

export default Fotocheck;