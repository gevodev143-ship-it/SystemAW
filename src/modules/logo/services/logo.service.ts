import { supabase } from "../../../lib/supabase";

export interface Logo {
  logo_id: number;
  logo_name: string;
  logo_description: string | null;
  logo_link_img: string;
  cust_id: number;
}

// Obtener todos los logos de un cust_id
export const obtenerLogosPorCustId = async (custId: number) => {
  return await supabase
    .from("logos")
    .select("*")
    .eq("cust_id", custId)
    .order("logo_id", { ascending: false });
};

// Subir imagen al bucket: (cust_name_bucket)/gestion_empresarial/logo/archivo
export const subirImagenLogo = async (
  file: File,
  custNameBucket: string
) => {
  const extension = file.name.split(".").pop();
  const nombreArchivo = `${Date.now()}.${extension}`;
  const path = `gestion_empresarial/logo/${nombreArchivo}`;

  const { error: uploadError } = await supabase.storage
    .from(custNameBucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { publicUrl: null, path: null, error: uploadError };
  }

  const { data: publicUrlData } = supabase.storage
    .from(custNameBucket)
    .getPublicUrl(path);

  return { publicUrl: publicUrlData.publicUrl, path, error: null };
};

// Eliminar imagen del bucket a partir del path guardado
export const eliminarImagenLogo = async (
  custNameBucket: string,
  path: string
) => {
  return await supabase.storage.from(custNameBucket).remove([path]);
};

// Crear registro en tabla logos
export const crearLogo = async (logo: {
  logo_name: string;
  logo_description: string | null;
  logo_link_img: string;
  cust_id: number;
}) => {
  return await supabase.from("logos").insert(logo).select().single();
};

// Actualizar registro
export const actualizarLogo = async (
  logo_id: number,
  cambios: Partial<Omit<Logo, "logo_id" | "cust_id">>
) => {
  return await supabase
    .from("logos")
    .update(cambios)
    .eq("logo_id", logo_id)
    .select()
    .single();
};

// Eliminar registro
export const eliminarLogo = async (logo_id: number) => {
  return await supabase.from("logos").delete().eq("logo_id", logo_id);
};