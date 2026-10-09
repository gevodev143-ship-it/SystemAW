import type { ComponentType } from "react";
import { icon } from "../../../../core/icons";

export interface RutaMenu {
  ruta: string;
  migas: string[]; // de lo más general a lo más específico
  Icono: ComponentType<{ className?: string }>;
}

export const RUTAS_MENU: RutaMenu[] = [
  { ruta: "/staffs", migas: ["Gestión Empresarial", "Personal", "Lista"], Icono: icon.iconUsers },
  { ruta: "/organizational-chart", migas: ["Gestión Empresarial", "Personal", "Organigrama"], Icono: icon.iconOrganigrama },
  { ruta: "/fotocheck", migas: ["Gestión Empresarial", "Personal", "Fotocheck"], Icono: icon.iconCargo },
  { ruta: "/job-position", migas: ["Gestión Empresarial", "Personal", "Cargo"], Icono: icon.iconUser },
  { ruta: "/roles", migas: ["Gestión Empresarial", "Personal", "Rol"], Icono: icon.iconRol },
  { ruta: "/attendances", migas: ["Gestión Empresarial", "Asistencia", "Registro"], Icono: icon.iconAsistencia },
  { ruta: "/logos", migas: ["Gestión Empresarial", "Almacenamiento"], Icono: icon.iconCarpeta },
];