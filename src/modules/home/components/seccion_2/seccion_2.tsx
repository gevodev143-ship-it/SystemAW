import { useState } from "react";
import style from "./seccion_2.module.css";
import type { Trabajador } from "../../pages/HomePage";

interface Seccion2Props {
  trabajadores: Trabajador[];
}

const Seccion_2 = ({ trabajadores }: Seccion2Props) => {
  const [filaAbierta, setFilaAbierta] = useState<number | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState<number | null>(null);

  const toggleFila = (index: number) => {
    setDetalleAbierto(null); // al cambiar de fila, cierra el sub-desplegable
    setFilaAbierta((prev) => (prev === index ? null : index));
  };

  const toggleDetalle = (index: number) => {
    setDetalleAbierto((prev) => (prev === index ? null : index));
  };

  return (
    <div className={style.seccion}>
      <section className={style.tabla}>

        <div className={style.header}>
          <span>Nombre</span>
          <span>Hora</span>
          <span>Interacciones</span>
          <span>Ver detalles</span>
        </div>

        {trabajadores.length === 0 && (
          <p className={style.sinResultados}>No se encontraron resultados</p>
        )}

        {trabajadores.map((t, i) => {
          const abierta = filaAbierta === i;
          return (
            <div key={i} className={style.filaWrapper}>
              <div className={style.fila}>
                <div className={style.nombreCol}>
                  <div className={style.avatar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <div>
                    <p className={style.nombre}>{t.nombre}</p>
                    <p className={style.cargo}>{t.cargo}</p>
                  </div>
                </div>
                <span className={style.celda}>{t.hora}</span>
                <span className={style.celda}>{t.interacciones}</span>
                <div className={style.celda}>
                  <button
                    className={style.btnDetalle}
                    onClick={() => toggleFila(i)}
                    disabled={!t.detalles || t.detalles.length === 0}
                  >
                    {abierta ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {/* Panel de detalles con animación suave */}
              <div
                className={`${style.panelDetalles} ${abierta ? style.panelAbierto : ""}`}
              >
                <div className={style.panelContenido}>
                  {t.detalles?.map((d, j) => {
                    const subAbierto = detalleAbierto === j;
                    return (
                      <div key={j} className={style.itemDetalle}>
                        <button
                          className={style.filaResumen}
                          onClick={() => toggleDetalle(j)}
                        >
                          <span className={style.horaDetalle}>{d.hora}</span>
                          <span className={style.descripcionDetalle}>{d.descripcion}</span>
                          <span
                            className={`${style.flecha} ${subAbierto ? style.flechaArriba : ""}`}
                          >
                            ▼
                          </span>
                        </button>

                        {d.cambios && d.cambios.length > 0 && (
                          <div
                            className={`${style.subPanel} ${subAbierto ? style.subPanelAbierto : ""}`}
                          >
                            <div className={style.subPanelContenido}>
                              {d.cambios.map((c, k) => (
                                <div key={k} className={style.lineaCambio}>
                                  <span className={style.horaDetalle}>{d.hora}</span>
                                  <span>
                                    {c.texto}
                                    {c.resaltado && (
                                      <strong> {c.resaltado}</strong>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

      </section>
    </div>
  );
};

export default Seccion_2;