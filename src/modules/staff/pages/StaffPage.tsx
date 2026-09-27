// import { useEffect, useRef } from "react";
import style from "./StaffPage.module.css"
import Seccion_1 from "../components/seccion_1/seccion_1";
import Seccion_2 from "../components/seccion_2/seccion_2";
import Seccion_3 from "../components/seccion_3/seccion_3";



export default function StaffPage() {


  return (
    <div className={style.page}>
      <Seccion_1 />
   
        <Seccion_2 />
        <Seccion_3 />

    </div>
  );
}