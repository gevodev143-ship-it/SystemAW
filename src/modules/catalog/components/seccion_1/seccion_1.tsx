import style from "./seccion_1.module.css";

interface Seccion1Props {
  filtroNombre: string;
  setFiltroNombre: (valor: string) => void;
  filtroImagenes: string;
  setFiltroImagenes: (valor: string) => void;
}

const OPCIONES_IMAGENES = ["todos", "Con imagen", "Sin imagen"];

const Seccion_1 = ({
  filtroNombre,
  setFiltroNombre,
  filtroImagenes,
  setFiltroImagenes,
}: Seccion1Props) => {
  return (
    <div className={style.seccion}>
      <section className={style.barra}>

        <input
          type="text"
          placeholder="Filtrar por nombre"
          className={style.inputNombre}
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />

        <div className={style.filtroGrupo}>
          <span>imagenes</span>
          <select
            className={style.select}
            value={filtroImagenes}
            onChange={(e) => setFiltroImagenes(e.target.value)}
          >
            {OPCIONES_IMAGENES.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </div>

      </section>
    </div>
  );
};

export default Seccion_1;