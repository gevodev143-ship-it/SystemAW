// import { useState } from "react";
import style from "./seccion_1.module.css";


const Seccion_1 = () => {

  return (
    <div className={style.seccion}>

      <div>
        <h2><b>Registro de Asistencia</b></h2>
        <p>Monitorea las entradas, salidas, horas trabajadas y tardanzas de los colaboradores en tiempo real.</p>
      </div>
      
      <div>
        <button className={style.boton}>
          <span className={style.icono}>⊕</span> Nuevo Registro
        </button>
      </div>
    </div>
  );
};

export default Seccion_1;