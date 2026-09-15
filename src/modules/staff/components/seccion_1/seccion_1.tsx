import { useState } from "react";
import style from "./seccion_1.module.css";
import Modal from "./modal";

const Seccion_1 = () => {
  const [showModal, setShowModal] = useState(false);

  const handleCreado = () => {
    setShowModal(false);
    // Aquí luego puedes refrescar una tabla de personales si la agregas
  };

  return (
    <div className={style.seccion}>
      <div>
        <h2><b>Listado de Personales</b></h2>
        <p>En esta seccion podras añadir, editar desactivar o hasta eliminar registros de los personales</p>
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