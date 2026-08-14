// import { useState } from "react";
// import Seccion_1 from "../components/seccion_1/seccion_1";
// import Seccion_2, { type Categoria } from "../components/seccion_2/seccion_2";
// import Seccion_3, { type Producto } from "../components/seccion_3/seccion_3";

// const productosIniciales: Producto[] = [
//   {
//     nombre: "ABRAZADERA 1 1/2 A 1/2 AGUA",
//     empresa: "CONCYSA",
//     categoriaTexto: "MATERIALES DE CONSTRUCCIÓN",
//     generico: "GENERICO",
//     categorias: ["MATERIALES DE CONSTRUCCIÓN", "FERRETERÍA", "PLOMERÍA"],
//     categoriaSeleccionada: "MATERIALES DE CONSTRUCCIÓN",
//     marcas: ["GENERICO", "TIGRE", "PAVCO"],
//     marcaSeleccionada: "GENERICO",
//   },
//   {
//     nombre: "TUBO PVC 1/2 AGUA FRIA",
//     empresa: "PAVCO",
//     categoriaTexto: "PLOMERÍA",
//     generico: "GENERICO",
//     categorias: ["MATERIALES DE CONSTRUCCIÓN", "FERRETERÍA", "PLOMERÍA"],
//     categoriaSeleccionada: "PLOMERÍA",
//     marcas: ["GENERICO", "TIGRE", "PAVCO"],
//     marcaSeleccionada: "PAVCO",
//   },
// ];

export default function ProductosPage() {
  // const [filtroNombre, setFiltroNombre] = useState("");
  // const [filtroImagenes, setFiltroImagenes] = useState("todos");
  // const [categoriaActiva, setCategoriaActiva] = useState<Categoria>("Productos");
  // const [productos, setProductos] = useState<Producto[]>(productosIniciales);

  // const productosFiltrados = productos.filter((p) => {
  //   const coincideNombre = p.nombre
  //     .toLowerCase()
  //     .includes(filtroNombre.toLowerCase());

  //   const coincideImagen =
  //     filtroImagenes === "todos" ||
  //     (filtroImagenes === "Con imagen" && !!p.imagen) ||
  //     (filtroImagenes === "Sin imagen" && !p.imagen);

  //   return coincideNombre && coincideImagen;
  // });

  // const handleCambiarCategoria = (index: number, valor: string) => {
  //   setProductos((prev) =>
  //     prev.map((p, i) => (i === index ? { ...p, categoriaSeleccionada: valor } : p))
  //   );
  // };

  // const handleCambiarMarca = (index: number, valor: string) => {
  //   setProductos((prev) =>
  //     prev.map((p, i) => (i === index ? { ...p, marcaSeleccionada: valor } : p))
  //   );
  // };

  // const handleEditar = (p: Producto, i: number) => {
  //   console.log("Editar", p, i);
  // };

  // const handleEliminar = (p: Producto, i: number) => {
  //   console.log("Eliminar", p, i);
  // };

  return (
    <div>
      {/* <Seccion_1
        filtroNombre={filtroNombre}
        setFiltroNombre={setFiltroNombre}
        filtroImagenes={filtroImagenes}
        setFiltroImagenes={setFiltroImagenes}
      />

      <Seccion_2 onCambiarCategoria={setCategoriaActiva} />

      <Seccion_3
        productos={productosFiltrados}
        onCambiarCategoria={handleCambiarCategoria}
        onCambiarMarca={handleCambiarMarca}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      /> */}
    </div>
  );
}