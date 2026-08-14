import { useState } from "react";
import style from "./seccion_2.module.css";

export type Categoria = "Productos" | "Categorias" | "Marcas";

interface Seccion2Props {
  onCambiarCategoria?: (categoria: Categoria) => void;
}

const OPCIONES: Categoria[] = ["Productos", "Categorias", "Marcas"];

const Seccion_2 = ({ onCambiarCategoria }: Seccion2Props) => {
  const [activa, setActiva] = useState<Categoria>("Productos");

  const seleccionar = (categoria: Categoria) => {
    setActiva(categoria);
    onCambiarCategoria?.(categoria);
  };

  return (
    <div className={style.seccion}>
      <section className={style.tabs}>
        {OPCIONES.map((opcion) => (
          <button
            key={opcion}
            className={`${style.tab} ${activa === opcion ? style.tabActiva : ""}`}
            onClick={() => seleccionar(opcion)}
          >
            {opcion}
          </button>
        ))}
      </section>
    </div>
  );
};

export default Seccion_2;