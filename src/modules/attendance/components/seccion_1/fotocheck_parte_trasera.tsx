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
        <div>
          <p className={style.telefono}>DNI{dni}</p>
          <p className={style.telefono}>TLF{telefono}</p>
        </div>
         
        
      </div>
    );
  }
);

FotocheckTrasera.displayName = "FotocheckTrasera";

export default FotocheckTrasera;