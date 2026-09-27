// CREATE TABLE staffs (
//     stff_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
//     stff_name       VARCHAR(200) NOT NULL,
//     stff_lastname   VARCHAR(200) NOT NULL,
//     stff_dni        VARCHAR(8) NOT NULL,
//     stff_phone      VARCHAR(9),
//     stff_link_img   TEXT,

//     -- Cliente al que pertenece el trabajador
//     cust_id BIGINT NOT NULL
//         REFERENCES customers(cust_id)
//         ON DELETE CASCADE,

//     -- Cargo que ocupa
//     jb_pstn_cust_id BIGINT NOT NULL
//         REFERENCES job_position_customers(jb_pstn_cust_id),

//     -- Rol/permisos dentro del sistema
//     role_cust_id BIGINT
//         REFERENCES role_customers(role_cust_id),

//     -- Jefe directo de este trabajador
//     -- NULL = no tiene jefe directo registrado
//     stff_supervisor_id BIGINT
//         REFERENCES staffs(stff_id)
//         ON DELETE SET NULL,

//     stff_active BOOLEAN NOT NULL DEFAULT TRUE
// );

import { supabase } from "../../../lib/supabase";
import type { Staff } from "../types";

export const createStaff = async (
  staff: Omit<Staff, "stff_id">
): Promise<Staff> => {
  const { data, error } = await supabase
    .from("staffs")
    .insert(staff)
    .select()
    .single();

  if (error) {
    console.error("Error al crear personal:", error);
    throw error;
  }
  return data;
};

export const deactivateStaff = async (
  stffId: number
): Promise<void> => {
  const { error } = await supabase
    .from("staffs")
    .update({
      stff_active: false
    })
    .eq("stff_id", stffId);

  if (error) {
    console.error("Error al desactivar personal:", error);
    throw error;
  }
};

export const activateStaff = async (
  stffId: number
): Promise<void> => {
  const { error } = await supabase
    .from("staffs")
    .update({
      stff_active: true
    })
    .eq("stff_id", stffId);

  if (error) {
    console.error("Error al activar personal:", error);
    throw error;
  }
};

export const listStaff = async (
  custId: number,
  page: number = 1,
  pageSize: number = 7
): Promise<{ data: Staff[]; count: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("staffs")
    .select(
      `
      *,
      job_position_customers (
        jb_pstn_cust_id,
        jb_pstn_cust_name
      )
    `,
      { count: "exact" }
    )
    .eq("cust_id", custId)
    .order("stff_id", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Error al listar personal:", error);
    throw error;
  }

  return { data: data ?? [], count: count ?? 0 };
};

export const getStaffImageUrl = (
  custNameBucket: string,
  stffLinkImg: string | null
): string | null => {
  if (!stffLinkImg) return null;

  const { data } = supabase.storage
    .from(custNameBucket)
    .getPublicUrl(`gestion_empresarial/personal/personal_img/${stffLinkImg}`);

  return data.publicUrl;
};

// Normaliza texto para usarlo como nombre de archivo:
// quita tildes/diacríticos, pasa a minúsculas y elimina cualquier
// caracter que no sea letra o número (espacios incluidos).
const normalizarNombreArchivo = (texto: string): string => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};

export const updateStaff = async (
  stffId: number,
  staff: Partial<Omit<Staff, "stff_id" | "job_position_customers">>
): Promise<Staff> => {
  const { data, error } = await supabase
    .from("staffs")
    .update(staff)
    .eq("stff_id", stffId)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar personal:", error);
    throw error;
  }
  return data;
};

export const uploadStaffImage = async (
  custNameBucket: string,
  stffId: number,
  stffName: string,
  stffDni: string,
  file: File
): Promise<string> => {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const nombreArchivo = `${normalizarNombreArchivo(
    `${stffName}${stffDni}`
  )}.${extension}`;
  const ruta = `gestion_empresarial/personal/personal_img/${nombreArchivo}`;

  const { error: errorSubida } = await supabase.storage
    .from(custNameBucket)
    .upload(ruta, file, {
      contentType: file.type || undefined,
    });

  if (errorSubida) {
    console.error("Error al subir imagen de personal:", errorSubida);
    throw errorSubida;
  }

  const { error: errorActualizacion } = await supabase
    .from("staffs")
    .update({ stff_link_img: nombreArchivo })
    .eq("stff_id", stffId);

  if (errorActualizacion) {
    console.error("Error al actualizar link de imagen:", errorActualizacion);
    throw errorActualizacion;
  }

  return nombreArchivo;
};
export const listAllStaffByCustomer = async (
  custId: number
): Promise<Pick<Staff, "stff_id" | "stff_name" | "stff_lastname">[]> => {
  const { data, error } = await supabase
    .from("staffs")
    .select("stff_id, stff_name, stff_lastname")
    .eq("cust_id", custId)
    .eq("stff_active", true)
    .order("stff_name", { ascending: true });

  if (error) {
    console.error("Error al listar todo el personal:", error);
    throw error;
  }

  return data ?? [];
};