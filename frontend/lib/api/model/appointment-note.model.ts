export interface AppointmentNoteCreate {
  appointment_guid?: string;
  patient_guid?: string;
  main_complaint?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  additional_remarks?: string;
  status?: string;
}

export interface AppointmentNoteUpdate {
  appointment_guid?: string;
  patient_guid?: string;
  main_complaint?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  additional_remarks?: string;
  status?: string;
}

export interface AppointmentNoteResponse {
  guid: string;
  appointment_guid?: string;
  patient_guid?: string;
  main_complaint?: string;
  blood_pressure?: string;
  heart_rate?: number;
  temperature?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
  weight?: number;
  additional_remarks?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
