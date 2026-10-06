import { useState } from "react";
import { useLocation } from "react-router-dom";
import style from "./BarraSuperior.module.css";
import { icon } from "../../../../core/icons";
import Modal from "./modal";
import { useEffect } from "react";
import { obtenerCustomerActual, type Customer } from "../../../../core/services/customer.service";

export default function BarraSuperior() {
  const location = useLocation();
  const isStaffs = location.pathname.startsWith("/staffs");
  const isorganizational_chart = location.pathname.startsWith("/organizational-chart");
  const isjobposition = location.pathname.startsWith("/job-position");
  const isrole = location.pathname.startsWith("/roles");
  const isAttendances = location.pathname.startsWith("/attendances");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [mostrarRoles, setMostrarRoles] = useState(false);
  const [mostrarEstados, setMostrarEstados] = useState(false);

  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    async function cargarCustomer() {
      const data = await obtenerCustomerActual();
      setCustomer(data);
    }

    cargarCustomer();
  }, []);
  return (
    <>
      <div className={style.barrasuperior}>

        {/* IZQUIERDA */}
        <div>
          {isStaffs && (
            <div className={style.seccionInfo}>
              {/* <button
                className={style.botonMenu}
                aria-label="Abrir menú"
                onClick={() => setModalAbierto(true)}
              >
                <icon.iconMenu className={style.iconHamburguesa} />
              </button> */}
              <icon.iconUsers className={style.iconUsers} />
              <div>
                <h2>Personal</h2>
              </div>
            </div>
          )}

          {isorganizational_chart && (
            <div className={style.seccionInfo}>
              <button className={style.botonMenu} aria-label="Abrir menú">
                <icon.iconMenu className={style.iconHamburguesa} />
              </button>
              <icon.iconOrganigrama className={style.iconUsers} />
              <div>
                <h2>Organigrama</h2>
              </div>
            </div>
          )}

          {isjobposition && (
            <div className={style.seccionInfo}>
              <button className={style.botonMenu} aria-label="Abrir menú">
                <icon.iconMenu className={style.iconHamburguesa} />
              </button>
              <icon.iconCargo className={style.iconUsers} />
              <div>
                <h2>Cargos</h2>
              </div>
            </div>
          )}

          {isrole && (
            <div className={style.seccionInfo}>
              <button className={style.botonMenu} aria-label="Abrir menú">
                <icon.iconMenu className={style.iconHamburguesa} />
              </button>
              <icon.iconRol className={style.iconUsers} />
              <div>
                <h2>Roles</h2>
              </div>
            </div>
          )}

          {isAttendances && (
            <div className={style.seccionInfo}>
              <button className={style.botonMenu} aria-label="Abrir menú">
                <icon.iconMenu className={style.iconHamburguesa} />
              </button>
              <icon.iconAsistencia className={style.iconUsers} />
              <div>
                <h2>Asistencia</h2>
              </div>
            </div>
          )}
        </div>

        {/* DERECHA */}
        <div className={style.usuario}>
          <icon.iconBell className={style.iconUsers} />

          <div className={style.circulo}>
            {customer?.cust_name_img_link ? (
              <img
                src={customer.cust_name_img_link}
                alt={`${customer.cust_name} ${customer.cust_lastname}`}
                className={style.imagenUsuario}
              />
            ) : (
              <icon.iconUser className={style.iconUser} />
            )}
          </div>

          <div className={style.datosUsuario}>
            <p>
              {customer
                ? `${customer.cust_name} ${customer.cust_lastname}`
                : "Cargando..."}
            </p>

            <p>Administrador</p>
          </div>

          <icon.iconArrowDown className={style.iconUsers} />
        </div>

      </div>

      {/* MODAL SEGÚN RUTA */}
      {modalAbierto && isStaffs && (
        <Modal onClose={() => setModalAbierto(false)}>
          <h3>Opciones de vista</h3>

          <label>
            <input
              type="checkbox"
              checked={mostrarRoles}
              onChange={(e) => setMostrarRoles(e.target.checked)}
            />
            Mostrar Roles
          </label>

          <label>
            <input
              type="checkbox"
              checked={mostrarEstados}
              onChange={(e) => setMostrarEstados(e.target.checked)}
            />
            Mostrar Estados
          </label>
        </Modal>
      )}
    </>
  );
}