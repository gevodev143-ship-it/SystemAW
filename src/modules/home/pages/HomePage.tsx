import { useState } from "react";
import Seccion_1 from "../components/seccion_1/seccion_1";
import Seccion_2 from "../components/seccion_2/seccion_2";


export type OrdenInteracciones = "normal" | "asc" | "desc";

export interface CambioDetalle {
  texto: string;
  resaltado?: string; // parte en negrita, ej. "Nosotros"
}

export interface InteraccionDetalle {
  hora: string;
  descripcion: string;
  cambios?: CambioDetalle[];
}

export interface Trabajador {
  nombre: string;
  cargo: string;
  hora: string;
  fecha: string;
  interacciones: number;
  detalles?: InteraccionDetalle[];
}

const trabajadores: Trabajador[] = [
  {
    nombre: "Carlos Jose Perez Muñez",
    cargo: "Diseñador",
    hora: "08:26",
    fecha: "2026-07-07",
    interacciones: 12,
    detalles: [
      {
        hora: "08:26",
        descripcion: "interactuo 6 veces en la barra superior",
        cambios: [
          { texto: "cambio el color del fondo #EBS002 por #56BA" },
          { texto: "cambio el color del fondo #EBS002 por #56BA" },
          { texto: "cambio el tipo de letra de Arial12 a ArialBold ⇒", resaltado: "Nosotros" },
          { texto: "cambio del icono (carrito) a (carrito2)" },
          { texto: "cambio del logo (logo) a (logo2)" },
        ],
      },
      {
        hora: "07:26",
        descripcion: "interactuo 6 veces en la barra inferior",
      },
    ],
  },
  { nombre: "Carlos Jose Perez Muñez", cargo: "Diseñador", hora: "08:26", fecha: "2026-07-06", interacciones: 5 },
  { nombre: "Ana Torres", cargo: "Administrador", hora: "09:10", fecha: "2026-07-07", interacciones: 8 },
  { nombre: "Luis Ramirez", cargo: "Almacenero", hora: "10:00", fecha: "2026-07-05", interacciones: 3 },
];
export default function HomePage() {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [ordenInteracciones, setOrdenInteracciones] = useState<OrdenInteracciones>("normal");
  const [filtroFecha, setFiltroFecha] = useState<string>(""); // "" = sin filtro de fecha

  let resultado = trabajadores.filter((t) => {
    const coincideNombre = t.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());
    const coincideCargo =
      filtroCargo === "todos" || t.cargo === filtroCargo;
    const coincideFecha =
      filtroFecha === "" || t.fecha === filtroFecha;
    return coincideNombre && coincideCargo && coincideFecha;
  });

  if (ordenInteracciones === "asc") {
    resultado = [...resultado].sort((a, b) => a.interacciones - b.interacciones);
  } else if (ordenInteracciones === "desc") {
    resultado = [...resultado].sort((a, b) => b.interacciones - a.interacciones);
  }

  return (
    <div>
      <Seccion_1
        filtroNombre={filtroNombre}
        setFiltroNombre={setFiltroNombre}
        filtroCargo={filtroCargo}
        setFiltroCargo={setFiltroCargo}
        ordenInteracciones={ordenInteracciones}
        setOrdenInteracciones={setOrdenInteracciones}
        filtroFecha={filtroFecha}
        setFiltroFecha={setFiltroFecha}
      />
      <Seccion_2 trabajadores={resultado} />
    </div>
  );
}