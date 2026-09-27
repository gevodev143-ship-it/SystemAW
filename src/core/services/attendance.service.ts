// -- =========================================================
// -- 1. TABLA PRINCIPAL DE ASISTENCIA
// -- =========================================================
// CREATE TABLE attendance (
//     att_id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

//     att_fecha           DATE NOT NULL DEFAULT CURRENT_DATE,

//     att_inicio_jornada  TIME,
//     att_inicio_receso   TIME,
//     att_fin_receso      TIME,
//     att_fin_jornada     TIME,

//     stff_id BIGINT NOT NULL -- id del personal
//         REFERENCES staffs(stff_id)
//         ON DELETE CASCADE,

//     CONSTRAINT uq_attendance_staff_fecha_turno -- para que no repita el registro 2 veces 
//         UNIQUE (stff_id, att_fecha)
// );

// ALTER TABLE attendance
//   ADD CONSTRAINT attendance_stff_id_fkey
//   FOREIGN KEY (stff_id) REFERENCES staffs(stff_id) ON DELETE CASCADE;

//   ALTER PUBLICATION supabase_realtime ADD TABLE attendance; -- para que automaticamente se muestre los cambios 

import { supabase } from "../../lib/supabase";

export const obtenerTotalAsistencias = async (stffId: number): Promise<number> => {
  const { count, error } = await supabase
    .from("attendance")
    .select("att_id", { count: "exact", head: true })
    .eq("stff_id", stffId);

  if (error) {
    console.error("Error al obtener total de asistencias:", error);
    return 0;
  }

  return count ?? 0;
};

export interface AsistenciaHoy {
  att_inicio_jornada: string | null;
  att_inicio_receso: string | null;
  att_fin_receso: string | null;
  att_fin_jornada: string | null;
}

export type EstadoAsistencia =
  | "Sin registro"
  | "En jornada"
  | "En descanso"
  | "Fuera de jornada";

// Nombre sugerido: refleja que trae el registro de asistencia del día actual para un staff puntual.
// Si prefieres otro nombre, lo cambio sin problema.
export const obtenerAsistenciaDeHoy = async (
  stffId: number
): Promise<AsistenciaHoy | null> => {
  const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const { data, error } = await supabase
    .from("attendance")
    .select("att_inicio_jornada, att_inicio_receso, att_fin_receso, att_fin_jornada")
    .eq("stff_id", stffId)
    .eq("att_fecha", hoy)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener la asistencia de hoy:", error);
    return null;
  }

  return data;
};

// Deriva el estado a partir de qué columnas de la jornada de hoy están llenas.
// Orden esperado de llenado: inicio_jornada -> inicio_receso -> fin_receso -> fin_jornada.
export const calcularEstadoAsistencia = (
  asistencia: AsistenciaHoy | null
): EstadoAsistencia => {
  if (!asistencia) return "Sin registro";

  const { att_inicio_jornada, att_inicio_receso, att_fin_receso, att_fin_jornada } =
    asistencia;

  if (!att_inicio_jornada) return "Sin registro";
  if (!att_inicio_receso) return "En jornada";
  if (!att_fin_receso) return "En descanso";
  if (!att_fin_jornada) return "En jornada";

  return "Fuera de jornada";
};