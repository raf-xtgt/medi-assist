export interface DoctorCreate {
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  about?: string;
  specialty?: string;
  image_url?: string;
  status?: string;
}

export interface DoctorUpdate {
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  about?: string;
  specialty?: string;
  image_url?: string;
  status?: string;
}

export interface DoctorResponse {
  guid: string;
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  about?: string;
  specialty?: string;
  image_url?: string;
  created_date?: string;
  status?: string;
}

export interface DoctorPatientRequest {
  doctor_guid: string;
  clinic_hdr_guid: string;
}

export interface DoctorPatientListItem {
  doctor_guid: string;
  clinic_hdr_guid: string;
  patient_guid: string;
  patient_phone: string;
  patient_name: string;
  patient_email: string;
  patient_address: string;
  total_completed_appointments: number;
}

export interface PatientAppointmentRequest {
  patient_guid: string;
}

export interface AppointmentNoteDetail {
  guid?: string;
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

export interface PatientAppointmentDetail {
  appointment_guid?: string;
  appointment_session_guid?: string;
  appointment_start_time?: string;
  appointment_end_time?: string;
  appointment_session_transcript?: string;
  appointment_session_transcript_status?: string;
  appointment_session_transcript_metadata?: Record<string, unknown>;
  appointment_note?: AppointmentNoteDetail;
  appointment_prescription_medicine_name?: string;
  appointment_prescription_dosage?: string;
  appointment_prescription_frequency?: string;
  appointment_prescription_duration?: string;
}

export interface PatientReport {
  doctor_guid?: string;
  clinic_hdr_guid?: string;
  patient_guid: string;
  total_appointment_sessions: number;
  appointment_detail_list: PatientAppointmentDetail[];
}

export interface DoctorSearchRequest {
  search_string: string;
}

export interface DoctorSearchResultItem {
  guid: string;
  name?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  about?: string;
  image_url?: string;
  clinic_hdr_guid?: string;
}

export interface DoctorSearchResponse {
  search_string: string;
  found_doctor: boolean;
  doctor_results: DoctorSearchResultItem[];
}

export interface DoctorSearchByNameRequest {
  search_string: string;
}

export interface DoctorSearchByNameResponse {
  search_string: string;
  found_doctor: boolean;
  doctor_name: string;
}

export interface DoctorImageUploadResponse {
  doctor_guid: string;
  image_url: string;
  blob_path: string;
}
