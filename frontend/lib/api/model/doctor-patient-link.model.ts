export interface DoctorPatientLinkCreate {
  doctor_guid?: string;
  patient_guid?: string;
  status?: string;
}

export interface DoctorPatientLinkUpdate {
  doctor_guid?: string;
  patient_guid?: string;
  status?: string;
}

export interface DoctorPatientLinkResponse {
  guid: string;
  doctor_guid?: string;
  patient_guid?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
