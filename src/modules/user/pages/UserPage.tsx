import { useState } from "react";
import Seccion_1 from "../components/seccion_1/seccion_1";
import Seccion_2, { type Trabajador } from "../components/seccion_2/seccion_2";

const trabajadores: Trabajador[] = [
  {
    nombre: "Carlos Jose Perez Muñez",
    cargo: "Administrador",
    usuario: "David",
    clave: "12345678",
    telefonos: ["905861250"],
    estado: "Activo",
  },
  {
    nombre: "Carlos Jose Perez Muñez",
    cargo: "Diseñador",
    usuario: "Carla",
    clave: "12345678",
    telefonos: ["995684235", "995684235"],
    estado: "Activo",
  },
];

export default function UserPage() {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("Activo");

  const trabajadoresFiltrados = trabajadores.filter((t) => {
    const coincideNombre = t.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const coincideCargo = filtroCargo === "todos" || t.cargo === filtroCargo;
    const coincideEstado = t.estado === filtroEstado;
    return coincideNombre && coincideCargo && coincideEstado;
  });

  const handleEditar = (t: Trabajador, i: number) => {
    console.log("Editar", t, i);
  };

  const handleEliminar = (t: Trabajador, i: number) => {
    console.log("Eliminar", t, i);
  };

  return (
    <div>
      <Seccion_1
        filtroNombre={filtroNombre}
        setFiltroNombre={setFiltroNombre}
        filtroCargo={filtroCargo}
        setFiltroCargo={setFiltroCargo}
        filtroEstado={filtroEstado}
        setFiltroEstado={setFiltroEstado}
        totalUsuarios={trabajadoresFiltrados.length}
        onAgregar={() => console.log("Agregar trabajador")}
      />
      <Seccion_2
        trabajadores={trabajadoresFiltrados}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
    </div>
  );
}