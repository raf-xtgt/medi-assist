export interface AppointmentCreate {
  clinic_guid?: string;
  doctor_guid?: string;
  patient_guid?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  appointment_status?: string;
  status?: string;
}

export interface AppointmentUpdate {
  clinic_guid?: string;
  doctor_guid?: string;
  patient_guid?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  appointment_status?: string;
  status?: string;
}

export interface AppointmentResponse {
  guid: string;
  clinic_guid?: string;
  doctor_guid?: string;
  patient_guid?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  appointment_status?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
