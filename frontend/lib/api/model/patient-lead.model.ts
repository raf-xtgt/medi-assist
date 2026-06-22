export interface PatientLeadCreate {
  phone?: string;
  name?: string;
  lead_status?: string;
  status?: string;
}

export interface PatientLeadUpdate {
  phone?: string;
  name?: string;
  lead_status?: string;
  status?: string;
}

export interface PatientLeadResponse {
  guid: string;
  phone?: string;
  name?: string;
  created_date?: string;
  lead_status?: string;
  status?: string;
}

export interface PatientLeadConversionRequest {
  doctor_guid: string;
  lead_guid: string;
}

export interface PatientLeadConversionResponse {
  patient_guid: string;
  doctor_patient_link_guid: string;
  lead_guid: string;
  doctor_guid: string;
}
