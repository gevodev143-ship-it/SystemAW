// role.type.ts

export interface Role {
  role_id: number;
  role_name: string;
  role_desc: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RoleCustomer {
  role_cust_id: number;
  role_cust_name: string;
  role_cust_description: string | null;
  cust_id: number;
}