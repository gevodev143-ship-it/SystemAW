import { supabase } from "../../lib/supabase";
import type { JobPositionCustomer } from "../types";

export const obtenerCargosPorCliente = async (
  custId: number
): Promise<JobPositionCustomer[]> => {
  const { data, error } = await supabase
    .from("job_position_customers")
    .select(`
      jb_pstn_cust_id,
      jb_pstn_cust_name,
      jb_pstn_cust_description,
      cust_id
    `)
    .eq("cust_id", custId)
    .order("jb_pstn_cust_name", {
      ascending: true,
    });

  if (error) {
    console.error("Error al obtener cargos:", error);
    throw error;
  }

  return data ?? [];
};