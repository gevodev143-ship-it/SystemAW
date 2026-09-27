import { supabase } from "../../../lib/supabase";
import type { RoleCustomer } from "../types";

export const obtenerRolesPorCliente = async (
  custId: number
): Promise<RoleCustomer[]> => {
  const { data, error } = await supabase
    .from("role_customers")
    .select(`
      role_cust_id,
      role_cust_name,
      role_cust_description,
      cust_id
    `)
    .eq("cust_id", custId)
    .order("role_cust_name", {
      ascending: true,
    });

  if (error) {
    console.error("Error al obtener roles:", error);
    throw error;
  }

  return data ?? [];
};