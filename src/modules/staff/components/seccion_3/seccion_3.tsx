
// useState un componente que se actualiza solo , CSSProperties para que sepa a donde moverse <- o ->
import { useState, type CSSProperties } from "react";

import style from "./seccion_3.module.css";
import Modal from "./shared/modal";
import ModalFoto from "./shared/modalFoto";
import ModalEditarStaff from "./shared/modalEditarStaff";

// se importa useAuth para obtener el id y nombre del bucket del customer
import { useAuth } from "../../../../core/contexts/auth.context";
import { useStaffController } from "../../controllers/staff.controller";
import type { StaffFilters, StaffListItem } from "../../../../core/types";

const TOTAL_COLUMNAS = 7;

interface Seccion3Props {
  filtros: StaffFilters;
}

const hayFiltrosActivos = (f: StaffFilters) =>
  f.busqueda.trim() !== "" ||
  f.cargoId !== null ||
  f.rolId !== null ||
  f.estado !== "";

const Seccion_3 = ({ filtros }: Seccion3Props) => {
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
    obtenerUrlImagenStaff,
  } = useStaffController(filtros);

  const [staffFoto, setStaffFoto] = useState<StaffListItem | null>(null);
  const [staffEditar, setStaffEditar] = useState<StaffListItem | null>(null);
  // Dirección de la animación: 1 = avanzar, -1 = retroceder
  const [direccion, setDireccion] = useState<1 | -1>(1);

  const irAPagina = (nueva: number) => {
    if (nueva < 1 || nueva > totalPaginas || nueva === paginaActual) return;
    setDireccion(nueva > paginaActual ? 1 : -1);
    setMenuAbierto(null);
    setPaginaActual(nueva);
  };

  const sinFilas = staffsPagina.length === 0;

  return (
    <div className={style.seccion}>
      {error && <span className={style.textoError}>{error}</span>}

      {sinFilas && loading ? (
        <p>Cargando personales...</p>
      ) : sinFilas ? (
        <p>
          {hayFiltrosActivos(filtros)
            ? "No se encontraron resultados con los filtros aplicados."
            : "No hay personales registrados."}
        </p>
      ) : (
        <>
          <div className={style.tablaViewport}>
            {/* key={paginaActual}: al cambiar de página el bloque se re-anima */}
            <div
              key={paginaActual}
              className={style.tablaPagina}
              style={{ "--dir": direccion } as CSSProperties}
            >
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
                    const urlImagen = obtenerUrlImagenStaff(staff.stff_link_img);
                    const nombreCompleto = `${staff.stff_name} ${staff.stff_lastname}`;

                    return (
                      <tr key={staff.stff_id}>
                        <td>
                          {urlImagen ? (
                            <img
                              src={urlImagen}
                              alt={nombreCompleto}
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

                        <td>{nombreCompleto}</td>
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
                            type="button"
                            className={style.botonMenu}
                            aria-label={`Acciones para ${nombreCompleto}`}
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
                      <td colSpan={TOTAL_COLUMNAS}>&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={style.paginacion}>
            <button
              type="button"
              aria-label="Página anterior"
              disabled={paginaActual === 1}
              onClick={() => irAPagina(paginaActual - 1)}
            >
              ‹
            </button>

            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                type="button"
                key={num}
                className={num === paginaActual ? style.paginaActiva : undefined}
                onClick={() => irAPagina(num)}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              aria-label="Página siguiente"
              disabled={paginaActual === totalPaginas}
              onClick={() => irAPagina(paginaActual + 1)}
            >
              ›
            </button>
          </div>
        </>
      )}

      
      {staffFoto && custNameBucket && (
        <ModalFoto
          urlImagen={obtenerUrlImagenStaff(staffFoto.stff_link_img)}
          nombreCompleto={`${staffFoto.stff_name} ${staffFoto.stff_lastname}`}
          staffId={staffFoto.stff_id}
          stffName={staffFoto.stff_name}
          stffLastname={staffFoto.stff_lastname}
          stffCargo={staffFoto.job_position_customers?.jb_pstn_cust_name ?? null}
          stffDni={staffFoto.stff_dni}
          custNameBucket={custNameBucket}
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