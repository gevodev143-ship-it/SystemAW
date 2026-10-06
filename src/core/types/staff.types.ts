import type { JobPositionCustomer, RoleCustomer } from ".";

/** Fila de la tabla `staffs`. */
export interface Staff {
  stff_id: number;
  stff_name: string;
  stff_lastname: string;
  stff_dni: string;
  stff_phone: string | null;
  stff_link_img: string | null;
  cust_id: number;
  jb_pstn_cust_id: number;
  role_cust_id: number | null;
  stff_supervisor_id: number | null;
  stff_active: boolean;
}

export type StaffCargoResumen = Pick<
  JobPositionCustomer,
  "jb_pstn_cust_id" | "jb_pstn_cust_name"
>;

/** Lo que devuelve `listStaff` (fila + cargo). */
export interface StaffListItem extends Staff {
  job_position_customers: StaffCargoResumen | null;
}

export interface StaffWithRelations extends Staff {
  job_position_customers: JobPositionCustomer | null;
  role_customers: RoleCustomer | null;
}

export type StaffInsert = Omit<Staff, "stff_id">;
export type StaffUpdate = Partial<Omit<Staff, "stff_id">>;

export type EstadoFiltro = "" | "ACTIVO" | "INACTIVO";

export interface StaffFilters {
  busqueda: string;
  cargoId: number | null;
  rolId: number | null;
  estado: EstadoFiltro;
}