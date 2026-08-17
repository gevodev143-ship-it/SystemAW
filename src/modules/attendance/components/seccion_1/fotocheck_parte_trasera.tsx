import { forwardRef } from "react";
import style from "./fotocheck_parte_trasera.module.css";
import { images } from "../../../../assets/img";

interface FotocheckTraseraProps {
  telefono: string;
}

const FotocheckTrasera = forwardRef<HTMLDivElement, FotocheckTraseraProps>(
  ({ telefono }, ref) => {
    return (
      <div ref={ref} className={style.fotocheck}>
        <div>
          <img
            src={images.logoGorrioncito}
            alt="Ferretería Gorrioncito"
            className={style.logoHeader}
          />
        </div>
         
        <p className={style.telefono}>{telefono}</p>
      </div>
    );
  }
);

FotocheckTrasera.displayName = "FotocheckTrasera";

export default FotocheckTrasera;