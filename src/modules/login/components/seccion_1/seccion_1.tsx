import { useState } from "react";
import style from "./seccion_1.module.css";
import ModalLogueo from "./modal_logueo";
import ModalFormulario from "./modal_formulario";

const Seccion_1 = () => {
  const [showRegistro, setShowRegistro] = useState(false);

  return (
    <div className={style.seccion}>
      {!showRegistro ? (
        <ModalLogueo onCrearCuenta={() => setShowRegistro(true)} />
      ) : (
        <ModalFormulario onYaTengoCuenta={() => setShowRegistro(false)} />
      )}
    </div>
  );
};

export default Seccion_1;