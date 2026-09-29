import { useState } from "react";
import style from "./seccion_1.module.css";
import Modal from "./shared/modal";

const Seccion_1 = () => {
  const [showModal, setShowModal] = useState(false);

  const handleCreado = () => {
    setShowModal(false);
  };

  return (
    <div className={style.seccion}>

      <div>
        <h2><b>Listado de Personales</b></h2>
        <p>Administra y organiza la información de tu personal, cargos, roles y estado laboral desde un solo lugar.</p>
      </div>
      
      <div>
        <button className={style.boton} onClick={() => setShowModal(true)}>
          <span className={style.icono}>⊕</span> Crear Personal
        </button>
      </div>

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onCreado={handleCreado}
        />
      )}
    </div>
  );
};

export default Seccion_1;