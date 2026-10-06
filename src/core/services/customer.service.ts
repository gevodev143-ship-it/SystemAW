import { supabase } from "../../lib/supabase";

export interface Customer {
  cust_id: number;
  cust_name: string;
  cust_lastname: string;
  cust_name_bucket: number;
  cust_name_img_link: string | null;
  cust_auth_id: string;
  cust_is_active: boolean;
  role_id: number;
}

export async function obtenerCustomerActual(): Promise<Customer | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("customers")
    .select(`
      cust_id,
      cust_name,
      cust_lastname,
      cust_name_bucket,
      cust_name_img_link,
      cust_auth_id,
      cust_is_active,
      role_id
    `)
    .eq("cust_auth_id", user.id)
    .single();

  if (error) {
    console.error("Error obteniendo customer:", error);
    return null;
  }

  return data;
}