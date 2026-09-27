// core/services/authService.ts
import { supabase } from "../../lib/supabase";

export const obtenerCustIdPorAuthId = async (authId: string) => {
  return supabase
    .from("customers")
    .select("cust_id, cust_name_bucket")
    .eq("cust_auth_id", authId)
    .maybeSingle();
};