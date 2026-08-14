import style from "./seccion_2.module.css";

export interface Trabajador {
  nombre: string;
  cargo: string;
  usuario: string;
  clave: string;
  telefonos: string[];
  estado: "Activo" | "Inactivo";
}

interface Seccion2Props {
  trabajadores: Trabajador[];
  onEditar: (trabajador: Trabajador, index: number) => void;
  onEliminar: (trabajador: Trabajador, index: number) => void;
}

const Seccion_2 = ({ trabajadores, onEditar, onEliminar }: Seccion2Props) => {
  return (
    <div className={style.seccion}>
      <section className={style.tabla}>

        <div className={style.header}>
          <span>Nombre</span>
          <span>usuario</span>
          <span>clave</span>
          <span>Número teléfono</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {trabajadores.length === 0 && (
          <p className={style.sinResultados}>No se encontraron resultados</p>
        )}

        {trabajadores.map((t, i) => (
          <div key={i} className={style.fila}>
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

            <span className={style.celda}>{t.usuario}</span>

            <span className={style.celda}>{"*".repeat(t.clave.length)}</span>

            <div className={style.celda}>
              {t.telefonos.map((tel, j) => (
                <p key={j} className={style.telefono}>{tel}</p>
              ))}
            </div>

            <div className={style.celda}>
              <span
                className={`${style.estadoBadge} ${
                  t.estado === "Activo" ? style.activo : style.inactivo
                }`}
              >
                {t.estado}
              </span>
            </div>

            <div className={style.celdaAcciones}>
              <button
                className={style.btnIcono}
                onClick={() => onEditar(t, i)}
                title="Editar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </button>
              <button
                className={style.btnIcono}
                onClick={() => onEliminar(t, i)}
                title="Eliminar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.7">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
          </div>
        ))}

      </section>
    </div>
  );
};

export default Seccion_2;