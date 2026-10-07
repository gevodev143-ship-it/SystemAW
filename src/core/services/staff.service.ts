import { supabase } from "../../lib/supabase";
import type {
  Staff,
  StaffCargoResumen,
  StaffFilters,
  // StaffInsert,
  StaffListItem,
  StaffUpdate,
  CreateStaffPayload
} from "../types/staff.types";

const TABLA = "staffs";
const RUTA_IMAGENES = "gestion_empresarial/personal/personal_img";

const COLUMNAS_STAFF = `
  stff_id,
  stff_name,
  stff_lastname,
  stff_dni,
  stff_phone,
  stff_link_img,
  cust_id,
  jb_pstn_cust_id,
  role_cust_id,
  stff_supervisor_id,
  stff_active
`;

const SELECT_LISTADO = `
  ${COLUMNAS_STAFF},
  job_position_customers (
    jb_pstn_cust_id,
    jb_pstn_cust_name
  )
`;

// Quita tildes, pasa a minúsculas y elimina todo lo que no sea letra o número.
const normalizarNombreArchivo = (texto: string): string =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const obtenerExtension = (archivo: File): string =>
  archivo.name.includes(".")
    ? (archivo.name.split(".").pop() ?? "").toLowerCase()
    : "";

// Separa la búsqueda en palabras y elimina caracteres que rompen el filtro
// `.or()` de PostgREST (comas, paréntesis, comodines, comillas).
const dividirBusqueda = (texto: string = ""): string[] =>
  texto
    .replace(/[,()%_*\\"]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

// ---------------------------------------------------------------------------
// CREAR
// ---------------------------------------------------------------------------

export async function createStaff(payload: CreateStaffPayload) {
  const { data, error } = await supabase.functions.invoke("staff-crud", {
    body: payload,
  });

  if (error) {
    // Si el servidor respondió con { error: "..." }, se muestra ese mensaje
    let mensaje: string | undefined;
    try {
      mensaje = (await error.context.json()).error;
    } catch {
      /* sin cuerpo legible */
    }
    throw new Error(mensaje ?? error.message);
  }
  return data.staff;
}

// ---------------------------------------------------------------------------
// ACTUALIZAR
// ---------------------------------------------------------------------------
export const updateStaff = async (
  stffId: number,
  staff: StaffUpdate
): Promise<Staff> => {
  const { data, error } = await supabase
    .from(TABLA)
    .update(staff)
    .eq("stff_id", stffId)
    .select(COLUMNAS_STAFF)
    .single();

  if (error) {
    console.error("Error al actualizar personal:", error);
    throw error;
  }
  return data as Staff;
};

// ---------------------------------------------------------------------------
// ACTIVAR / DESACTIVAR
// ---------------------------------------------------------------------------
export const setStaffActive = async (
  stffId: number,
  active: boolean
): Promise<void> => {
  const { error } = await supabase
    .from(TABLA)
    .update({ stff_active: active })
    .eq("stff_id", stffId);

  if (error) {
    console.error(
      `Error al ${active ? "activar" : "desactivar"} personal:`,
      error
    );
    throw error;
  }
};

// Se mantienen por compatibilidad; bórralas si no se usan en otro lugar.
export const activateStaff = (stffId: number) => setStaffActive(stffId, true);
export const deactivateStaff = (stffId: number) => setStaffActive(stffId, false);

// ---------------------------------------------------------------------------
// LISTAR (paginado + filtros en servidor)
// ---------------------------------------------------------------------------
export const listStaff = async (
  custId: number,
  page: number = 1,
  pageSize: number = 7,
  filtros: Partial<StaffFilters> = {}
): Promise<{ data: StaffListItem[]; count: number }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { busqueda, cargoId, rolId, estado } = filtros;

  let consulta = supabase
    .from(TABLA)
    .select(SELECT_LISTADO, { count: "exact" })
    .eq("cust_id", custId);

  if (cargoId != null) consulta = consulta.eq("jb_pstn_cust_id", cargoId);
  if (rolId != null) consulta = consulta.eq("role_cust_id", rolId);
  if (estado) consulta = consulta.eq("stff_active", estado === "ACTIVO");

  // Cada palabra debe coincidir con nombre, apellido o DNI (AND entre palabras).
  for (const palabra of dividirBusqueda(busqueda)) {
    consulta = consulta.or(
      `stff_name.ilike.%${palabra}%,stff_lastname.ilike.%${palabra}%,stff_dni.ilike.%${palabra}%`
    );
  }

  const { data, error, count } = await consulta
    .order("stff_id", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Error al listar personal:", error);
    throw error;
  }

  const filas: StaffListItem[] = (data ?? []).map((fila) => {
    const cargo = fila.job_position_customers as unknown;
    return {
      ...fila,
      job_position_customers: Array.isArray(cargo)
        ? ((cargo[0] as StaffCargoResumen | undefined) ?? null)
        : ((cargo as StaffCargoResumen | null) ?? null),
    };
  });

  return { data: filas, count: count ?? 0 };
};

// ---------------------------------------------------------------------------
// IMAGEN
// ---------------------------------------------------------------------------
export const getStaffImageUrl = (
  custNameBucket: string,
  stffLinkImg: string | null
): string | null => {
  if (!stffLinkImg) return null;

  const { data } = supabase.storage
    .from(custNameBucket)
    .getPublicUrl(`${RUTA_IMAGENES}/${stffLinkImg}`);

  return data.publicUrl;
};

export const uploadStaffImage = async (
  custNameBucket: string,
  stffId: number,
  stffName: string,
  stffDni: string,
  file: File
): Promise<string> => {
  const base = normalizarNombreArchivo(`${stffName}${stffDni}`);
  const extension = obtenerExtension(file);
  const nombreArchivo = extension ? `${base}.${extension}` : base;

  const { error: errorSubida } = await supabase.storage
    .from(custNameBucket)
    .upload(`${RUTA_IMAGENES}/${nombreArchivo}`, file, {
      contentType: file.type || undefined,
      upsert: true, // permite reintentar si antes falló el update de la BD
    });

  if (errorSubida) {
    console.error("Error al subir imagen de personal:", errorSubida);
    throw errorSubida;
  }

  const { error: errorActualizacion } = await supabase
    .from(TABLA)
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

// ---------------------------------------------------------------------------
// CANDIDATOS A JEFE DIRECTO (sin paginar, solo activos, con cargo)
// ---------------------------------------------------------------------------
export const listSupervisorCandidates = async (
  custId: number
): Promise<StaffListItem[]> => {
  const { data, error } = await supabase
    .from(TABLA)
    .select(SELECT_LISTADO)
    .eq("cust_id", custId)
    .eq("stff_active", true)
    .order("stff_name", { ascending: true });

  if (error) {
    console.error("Error al listar posibles jefes:", error);
    throw error;
  }

  return (data ?? []).map((fila) => {
    const cargo = fila.job_position_customers as unknown;
    return {
      ...fila,
      job_position_customers: Array.isArray(cargo)
        ? ((cargo[0] as StaffCargoResumen | undefined) ?? null)
        : ((cargo as StaffCargoResumen | null) ?? null),
    };
  });
};