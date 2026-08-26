import { Outlet } from "react-router-dom";
import BarraInferior from "../components/layout/BarraInferior/BarraInferior";

export default function HomeLayout() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "auto",
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      <main style={{ width: "100%", height: "100%" }}>
        <Outlet />
        <BarraInferior/>
      </main>
      
    </div>
  );
}     