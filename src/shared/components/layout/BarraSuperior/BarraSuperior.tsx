import { useLocation } from "react-router-dom";
import style from "./BarraSuperior.module.css";
import { icon } from "../../../../core/icons";

export default function BarraSuperior() {
  const location = useLocation();
  const isStaffs = location.pathname.startsWith("/staffs");
  const isAttendances = location.pathname.startsWith("/attendances");

  return (
    <div className={style.barrasuperior}>
      {isStaffs && (
        <div className={style.seccionInfo}>
          <icon.iconUsers className={style.iconUsers} />
          <div>
            <h2>Personales</h2>
            <span>Gestiona la información de tus personales</span>
          </div>
        </div>
      )}

      {isAttendances && (
        <div className={style.seccionInfo}>
          <icon.iconAsistencia className={style.iconUsers} />
          <div>
            <h2>Asistencia</h2>
            <span>Gestiona la información de la asistencia</span>
          </div>
        </div>
      )}

      <icon.iconBell className={style.iconUsers} />

      {/* aqui esta su nombre del rol del usuario  */}
      
      {/* aqui es donde esta la imagen del usuario */}
      <div className={style.circulo}>
        <icon.iconUser className={style.iconUser}/>
      </div>
      <div>
        <p>David Jhunior</p>
        <p>dministrador</p>
      </div>
      <icon.iconArrowDown className={style.iconUsers}/>
      
    </div>
  );
}