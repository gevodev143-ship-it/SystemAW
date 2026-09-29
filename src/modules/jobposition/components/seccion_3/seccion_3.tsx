import { useState, type CSSProperties } from "react";

import style from "./seccion_3.module.css";
import Modal, { type ModoModal } from "../seccion_1/shared/modal";

import { useAuth } from "../../../../core/contexts/auth.context";
import {
  useJobPositionController,
  type JobPositionFilters,
} from "../../controllers/jobposition.controller";
import type { JobPositionCustomer } from "../../../../core/types";

const TOTAL_COLUMNAS = 3;

interface Seccion3Props {
  filtros: JobPositionFilters;
  recargaKey: number;
}

interface AccionCargo {
  modo: Exclude<ModoModal, "crear">;
  cargo: JobPositionCustomer;
}

const Seccion_3 = ({ filtros, recargaKey }: Seccion3Props) => {
  const { custId } = useAuth();

  const {
    cargosPagina,
    loading,
    error,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    itemsPorPagina,
    recargar,
  } = useJobPositionController(filtros, recargaKey);

  const [accion, setAccion] = useState<AccionCargo | null>(null);
  // Dirección de la animación: 1 = avanzar, -1 = retroceder
  const [direccion, setDireccion] = useState<1 | -1>(1);

  const irAPagina = (nueva: number) => {
    if (nueva < 1 || nueva > totalPaginas || nueva === paginaActual) return;
    setDireccion(nueva > paginaActual ? 1 : -1);
    setPaginaActual(nueva);
  };

  const sinFilas = cargosPagina.length === 0;

  return (
    <div className={style.seccion}>
      {error && <span className={style.textoError}>{error}</span>}

      {sinFilas && loading ? (
        <p>Cargando cargos...</p>
      ) : sinFilas ? (
        <p>
          {filtros.busqueda.trim() !== ""
            ? "No se encontraron resultados con los filtros aplicados."
            : "No hay cargos registrados."}
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
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cargosPagina.map((cargo) => (
                    <tr key={cargo.jb_pstn_cust_id}>
                      <td>{cargo.jb_pstn_cust_name}</td>
                      <td>{cargo.jb_pstn_cust_description || "—"}</td>
                      <td className={style.acciones}>
                        <button
                          type="button"
                          className={style.botonAccion}
                          onClick={() => setAccion({ modo: "editar", cargo })}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={style.botonAccion}
                          onClick={() => setAccion({ modo: "eliminar", cargo })}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {Array.from({
                    length: Math.max(0, itemsPorPagina - cargosPagina.length),
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

      {accion && custId !== null && (
        <Modal
          modo={accion.modo}
          custId={custId}
          cargo={accion.cargo}
          onClose={() => setAccion(null)}
          onGuardado={() => {
            setAccion(null);
            recargar();
          }}
        />
      )}
    </div>
  );
};

export default Seccion_3;