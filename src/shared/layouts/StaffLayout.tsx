import { Outlet } from "react-router-dom";
import BarraSuperior from "../components/layout/BarraSuperior/BarraSuperior";
import Sidebar from "../components/layout/Sidebar/sidebar";

export default function StaffLayout() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
  
      <Sidebar />

      <main style={{ flex: 1, overflow: "auto" }}>
        <BarraSuperior/>
        <Outlet />
      </main>
    </div>
  );
}     