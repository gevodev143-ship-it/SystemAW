import style from "./seccion_3.module.css";
import Modal from "./shared/modal";
import ModalFoto from "./shared/modalFoto";
import ModalEditarStaff from "./shared/modalEditarStaff"; // ← nuevo
import { useState } from "react";
import { useAuth } from "../../../../core/contexts/auth.context";
import { useStaffController } from "../../controllers/staff.controller";
import { getStaffImageUrl } from "../../services/staff.service";
import type { Staff } from "../../types/staff.type";

const Seccion_3 = () => {
  const { custId, custNameBucket } = useAuth(); 

  const {
    staffsPagina,
    loading,
    error,
    menuAbierto,
    setMenuAbierto,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    itemsPorPagina,
    toggleActivo,
    recargar,
  } = useStaffController();

  const [staffFoto, setStaffFoto] = useState<Staff | null>(null);
  const [staffEditar, setStaffEditar] = useState<Staff | null>(null); // ← nuevo


  return (
    <div className={style.seccion}>
      {error && <span className={style.textoError}>{error}</span>}

      {loading ? (
        <p>Cargando personales...</p>
      ) : staffsPagina.length === 0 ? (
        <p>No hay personales registrados.</p>
      ) : (
        <>
          <table className={style.tabla}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {staffsPagina.map((staff) => {
                const urlImagen = custNameBucket
                  ? getStaffImageUrl(custNameBucket, staff.stff_link_img)
                  : null;

                return (
                  <tr key={staff.stff_id}>
                    <td>
                      {urlImagen ? (
                        <img
                          src={urlImagen}
                          alt={`${staff.stff_name} ${staff.stff_lastname}`}
                          className={style.foto}
                          onClick={() => setStaffFoto(staff)}
                        />
                      ) : (
                        <div
                          className={style.fotoVacia}
                          onClick={() => setStaffFoto(staff)}
                        />
                      )}
                    </td>

                    <td>
                      {staff.stff_name} {staff.stff_lastname}
                    </td>

                    <td>{staff.stff_dni}</td>

                    <td>{staff.stff_phone || "—"}</td>

                    <td>
                      {staff.job_position_customers?.jb_pstn_cust_name || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          staff.stff_active
                            ? style.badgeActivo
                            : style.badgeInactivo
                        }
                      >
                        {staff.stff_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className={style.acciones}>
                      <button
                        className={style.botonMenu}
                        onClick={() =>
                          setMenuAbierto(
                            menuAbierto === staff.stff_id ? null : staff.stff_id
                          )
                        }
                      >
                        ⋮
                      </button>

                      {menuAbierto === staff.stff_id && (
                        <Modal
                          opciones={[
                            {
                              label: "Ver información",
                              onClick: () => setMenuAbierto(null),
                            },
                            {
                              label: "Editar",
                              onClick: () => {
                                setStaffEditar(staff);
                                setMenuAbierto(null);
                              },
                            },
                            {
                              label: staff.stff_active ? "Desactivar" : "Activar",
                              onClick: () => toggleActivo(staff),
                            },
                          ]}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}

              {Array.from({
                length: Math.max(0, itemsPorPagina - staffsPagina.length),
              }).map((_, i) => (
                <tr key={`vacia-${i}`} className={style.filaVacia}>
                  <td colSpan={7}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={style.paginacion}>
            <button
              disabled={paginaActual === 1}
              onClick={() => setPaginaActual((p) => p - 1)}
            >
              ‹
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
              (num) => (
                <button
                  key={num}
                  className={
                    num === paginaActual ? style.paginaActiva : undefined
                  }
                  onClick={() => setPaginaActual(num)}
                >
                  {num}
                </button>
              )
            )}

            <button
              disabled={paginaActual === totalPaginas}
              onClick={() => setPaginaActual((p) => p + 1)}
            >
              ›
            </button>
          </div>
        </>
      )}

      {staffFoto && (
        <ModalFoto
          urlImagen={
            custNameBucket
              ? getStaffImageUrl(custNameBucket, staffFoto.stff_link_img)
              : null
          }
          nombreCompleto={`${staffFoto.stff_name} ${staffFoto.stff_lastname}`}
          staffId={staffFoto.stff_id}
          stffName={staffFoto.stff_name}
          stffDni={staffFoto.stff_dni}
          custNameBucket={custNameBucket ?? ""}
          onClose={() => setStaffFoto(null)}
          onImagenSubida={(nuevoLinkImg) => {
            setStaffFoto((prev) =>
              prev ? { ...prev, stff_link_img: nuevoLinkImg } : prev
            );
            recargar();
          }}
        />
      )}
       {staffEditar && custId !== null && (
        <ModalEditarStaff
          staff={staffEditar}
          custId={custId}
          onClose={() => setStaffEditar(null)}
          onGuardado={recargar}
        />
      )}
    
    </div>
  );
};

export default Seccion_3;