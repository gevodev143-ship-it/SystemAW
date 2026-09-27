// staff.type.ts

import type {
  JobPositionCustomer,
} from "./job-position.type";

import type {
  RoleCustomer,
} from "./role.type";

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
    job_position_customers?: {
    jb_pstn_cust_id: number;
    jb_pstn_cust_name: string;
  } | null;
}

export interface StaffWithRelations extends Staff {
  job_position_customers: JobPositionCustomer | null;
  role_customers: RoleCustomer | null;
}