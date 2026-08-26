// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
import style from "./BarraSuperior.module.css";

export default function BarraSuperior() {

  return (
    <div className={style.barrasuperior}>
      {/* aqui esta su nombre del rol del usuario */}
      Administrador
      {/* aqui es donde esta la imagen del usuario */}
      <div className={style.logo}>
        <img src="/logo.png" alt="" />
      </div>
      <p>David Jhunior</p>
    </div>
  );
}
