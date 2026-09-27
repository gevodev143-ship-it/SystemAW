// job-position.type.ts

export interface JobPosition {
  jb_pstn_id: number;
  jb_pstn_name: string;
  jb_pstn_description: string | null;
}

export interface JobPositionCustomer {
  jb_pstn_cust_id: number;
  jb_pstn_cust_name: string;
  jb_pstn_cust_description: string | null;
  cust_id: number;
}   