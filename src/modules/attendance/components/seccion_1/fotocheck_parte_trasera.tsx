import { forwardRef } from "react";
import style from "./fotocheck_parte_trasera.module.css";
import { images } from "../../../../assets/img";

interface FotocheckTraseraProps {
  telefono: string;
  dni: string;
}

const FotocheckTrasera = forwardRef<HTMLDivElement, FotocheckTraseraProps>(
  ({ telefono, dni }, ref) => {
    return (
      <div ref={ref} className={style.fotocheck}>
        <div className={style.imagen}>
          <img
            src={images.logo_parte_trasera}
            alt="Ferretería Gorrioncito"
            className={style.logoHeader}
          />
        </div>

        <div className={style.contenido}>
          <hr />
          <div className={style.bloque}>
            <p className={style.titulo}><b>Misión</b></p>
            <p className={style.texto}>
              Brindar productos de ferretería de calidad y soluciones prácticas, con atención
              cercana y confiable a nuestros clientes.
            </p>
          </div>
          <hr />
          <div className={style.bloque}>
            <p className={style.titulo}><b>Visión</b></p>
            <p className={style.texto}>
              Ser la ferretería de referencia en la región, destacando por la calidad, servicio y
              soluciones innovadoras.
            </p>
          </div>
          <hr />
          <div className={style.bloque}>
            <p className={style.titulo}>Valores</p>
            <div className={style.valoresFila}>
              <p className={style.texto}>
                &gt; Integridad
                <br />
                &gt; Compromiso
                <br />
                &gt; Servicio
              </p>
              <p className={style.texto}>
                &gt; Confianza
                <br />
                &gt; Calidad
                <br />
                &gt; Innovación
              </p>
            </div>
          </div>
          <hr />
          <div className={style.datoFila}>
            <span className={style.datoEtiqueta}>DNI</span>
            <span className={style.datoValor}>{dni}</span>
          </div>
          <div className={style.datoFila}>
            <span className={style.datoEtiqueta1}>TLF</span>
            <span className={style.datoValor1}>{telefono}</span>
          </div>
        </div>
      </div>
    );
  }
);

FotocheckTrasera.displayName = "FotocheckTrasera";

export default FotocheckTrasera;