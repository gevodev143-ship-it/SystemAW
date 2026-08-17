import { forwardRef } from "react";
import style from "./fotocheck_parte_trasera.module.css";
import { images } from "../../../../assets/img";

interface FotocheckTraseraProps {
  telefono: string;
  dni: string;
}

const FotocheckTrasera = forwardRef<HTMLDivElement, FotocheckTraseraProps>(
  ({ telefono,dni }, ref) => {
    return (
      <div ref={ref} className={style.fotocheck}>
        <div className={style.imagen}>
          <img
            src={images.logo_parte_trasera}
            alt="Ferretería Gorrioncito"
            className={style.logoHeader}
          />
        </div>
        <br />
        
        <div>
          <hr />
          <div>
            <p><b>Misión</b></p>
            <p>Brindar productos de ferreteria de calidad y soluciones practicas ,con atencion cercana y confiable a nuestros clientes.</p>
          </div>
          <hr />
          <div>
            <p><b>Visión</b></p>
            <p>Ser la ferreteria de referencia en la region ,destacando por la calidas ,servicio y soluciones innovadoras.</p>
          </div>
          <div>

          </div>
          <hr />
          <p className={style.telefono}>DNI{dni}</p>
          <p className={style.telefono}>TLF{telefono}</p>
        </div>
         
        
      </div>
    );
  }
);

FotocheckTrasera.displayName = "FotocheckTrasera";

export default FotocheckTrasera;