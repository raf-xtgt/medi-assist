export interface PrescriptionCreate {
  appointment_guid?: string;
  patient_guid?: string;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  status?: string;
}

export interface PrescriptionUpdate {
  appointment_guid?: string;
  patient_guid?: string;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  status?: string;
}

export interface PrescriptionResponse {
  guid: string;
  appointment_guid?: string;
  patient_guid?: string;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
