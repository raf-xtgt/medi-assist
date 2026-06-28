import type { AppointmentNoteDetail } from "./doctor.model";

export interface PrescriptionHistoryItem {
  guid?: string;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

export interface ClinicalReportHistoryItem {
  guid?: string;
  summary?: string;
  key_observations?: string[];
  red_flags?: string[];
  lifestyle_and_diet?: string[];
  care_plan_steps?: string[];
  form_discrepancies?: string[];
  patient_comprehension_rating?: string;
}

export interface AppointmentHistoryRecord {
  appointment_guid: string;
  running_no?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  appointment_status?: string;
  appointment_note?: AppointmentNoteDetail;
  prescriptions: PrescriptionHistoryItem[];
  clinical_report?: ClinicalReportHistoryItem;
}

export interface PatientHistoryResponse {
  doctor_guid?: string;
  patient_guid: string;
  patient_name?: string;
  patient_phone?: string;
  patient_triage_summary?: string;
  history_timeline: AppointmentHistoryRecord[];
}

export interface DoctorPatientHistoryRequest {
  doctor_guid: string;
  patient_guid: string;
}

export interface PatientOnlyHistoryRequest {
  patient_guid: string;
}
