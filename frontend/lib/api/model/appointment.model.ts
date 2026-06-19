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

export interface PatientAppointmentListingRequest {
  doctor_guid: string;
  patient_guid: string;
}

export interface PatientAppointmentListingItem {
  doctor_guid: string;
  patient_guid: string;
  appointment_guid?: string;
  appointment_start_time?: string;
  appointment_end_time?: string;
  appointment_status?: string;
  appointment_running_no?: string;
}
