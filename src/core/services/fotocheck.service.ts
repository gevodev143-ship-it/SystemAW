import { supabase } from "../../lib/supabase";
import type { Fotocheck } from "../types/fotocheck.types";

const TABLA = "fotochecks";

const COLUMNAS_FOTOCHECK = `
  fotocheck_id,
  fotocheck_name,
  fotocheck_description,
  fotocheck_config,
  fotocheck_preview,
  fotocheck_active,
  is_default,
  cust_id,
  created_at,
  updated_at
`;

// ---------------------------------------------------------------------------
// FOTOCHECK PREDETERMINADO DEL CLIENTE
// (la tabla garantiza solo uno con is_default = TRUE por cliente)
// ---------------------------------------------------------------------------
export const getDefaultFotocheck = async (
  custId: number
): Promise<Fotocheck | null> => {
  const { data, error } = await supabase
    .from(TABLA)
    .select(COLUMNAS_FOTOCHECK)
    .eq("cust_id", custId)
    .eq("is_default", true)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener el fotocheck predeterminado:", error);
    throw error;
  }
  return (data as Fotocheck | null) ?? null;
};

// ---------------------------------------------------------------------------
// URL de las imágenes (logos, etc.) guardadas dentro de fotocheck_config
// Cada elemento "image" trae su propio `bucket` y `path`.
// ---------------------------------------------------------------------------
export const getFotocheckImageUrl = (
  bucket: string,
  path: string
): string | null => {
  if (!bucket || !path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};