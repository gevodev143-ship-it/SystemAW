import { useRef } from "react";
import style from "./seccion_1.module.css";
import type { OrdenInteracciones } from "../../pages/HomePage";

interface Seccion1Props {
  filtroNombre: string;
  setFiltroNombre: (valor: string) => void;
  filtroCargo: string;
  setFiltroCargo: (valor: string) => void;
  ordenInteracciones: OrdenInteracciones;
  setOrdenInteracciones: (valor: OrdenInteracciones) => void;
  filtroFecha: string;
  setFiltroFecha: (valor: string) => void;
}

const CARGOS = ["todos", "Diseñador", "Administrador", "Almacenero"];

const OPCIONES_INTERACCIONES: { value: OrdenInteracciones; label: string }[] = [
  { value: "normal", label: "normal" },
  { value: "asc", label: "Menor a mayor" },
  { value: "desc", label: "Mayor a menor" },
];

const Seccion_1 = ({
  filtroNombre,
  setFiltroNombre,
  filtroCargo,
  setFiltroCargo,
  ordenInteracciones,
  setOrdenInteracciones,
  filtroFecha,
  setFiltroFecha,
}: Seccion1Props) => {
  const fechaInputRef = useRef<HTMLInputElement>(null);

  const abrirCalendario = () => {
    const input = fechaInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  };

  const formatearFecha = (iso: string) => {
    const [anio, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <div className={style.seccion}>
      <section className={style.seccion1}>

        <input
          type="text"
          placeholder="Filtrar por nombre"
          className={style.inputNombre}
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />

        <div className={style.filtroGrupo}>
          <span>Cargo</span>
          <select
            className={style.selectCargo}
            value={filtroCargo}
            onChange={(e) => setFiltroCargo(e.target.value)}
          >
            {CARGOS.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargo}
              </option>
            ))}
          </select>
        </div>

        <div className={style.filtroGrupo}>
          <span>interacciones</span>
          <select
            className={style.selectCargo}
            value={ordenInteracciones}
            onChange={(e) =>
              setOrdenInteracciones(e.target.value as OrdenInteracciones)
            }
          >
            {OPCIONES_INTERACCIONES.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        <div className={style.filtroGrupo}>
          <span>Fecha</span>
          <button onClick={abrirCalendario}>
            {filtroFecha ? formatearFecha(filtroFecha) : "Hoy"}
          </button>
          <input
            ref={fechaInputRef}
            type="date"
            className={style.inputFechaOculto}
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
          {filtroFecha && (
            <button
              className={style.btnLimpiarFecha}
              onClick={() => setFiltroFecha("")}
              title="Quitar filtro de fecha"
            >
              ×
            </button>
          )}
        </div>

      </section>
    </div>
  );
};

export default Seccion_1;