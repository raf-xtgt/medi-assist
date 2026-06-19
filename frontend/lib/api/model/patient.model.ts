export interface PatientCreate {
  lead_guid?: string;
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  status?: string;
}

export interface PatientUpdate {
  lead_guid?: string;
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  status?: string;
}

export interface PatientResponse {
  guid: string;
  lead_guid?: string;
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
