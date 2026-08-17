import { useState } from "react";
import style from "./seccion_2.module.css";
import ModalReporte from "./modal_reporte";

const Seccion_2 = () => {
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div className={style.seccion}>
      <button
        type="button"
        className={style.btnReporte}
        onClick={() => setMostrarModal(true)}
      >
        Hacer reporte
      </button>

      {mostrarModal && (
        <ModalReporte onClose={() => setMostrarModal(false)} />
      )}
    </div>
  );
};

export default Seccion_2;