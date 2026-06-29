// --- Admin Dashboard Types ---
export interface AdminKpiMetrics {
  total_appointments: number;
  remaining_appointments: number;
  completed_appointments: number;
  completion_rate: number;
  canceled_or_postponed_appointments: number;
  average_utilization_rate: number;
}

export interface DoctorLoadItem {
  doctor_guid: string;
  doctor_name: string;
  specialty: string;
  completed_appointments: number;
  total_appointments: number;
  utilization_percentage: number;
}

export interface AdminAppointmentItem {
  appointment_guid: string;
  time: string;
  patient_name: string;
  doctor_name: string;
  visit_type: string;
  appointment_status: string;
}

export interface AdminDashboardResponse {
  clinic_guid: string;
  date: string; // ISO date string (YYYY-MM-DD)
  kpis: AdminKpiMetrics;
  provider_loads: DoctorLoadItem[];
  appointments: AdminAppointmentItem[];
}

// --- Doctor Dashboard Types ---
export interface DoctorKpiMetrics {
  patients_today: number;
  patients_remaining: number;
  total_appointments: number;
  next_appointment_time: string | null;
  pending_notes: number;
  avg_consult_duration_minutes: number;
}

export interface QueuePatientItem {
  patient_guid: string;
  patient_name: string;
  age: number;
  appointment_guid: string;
  scheduled_start: string; // ISO datetime string
  reason: string;
  appointment_status: string;
}

export interface ActivityItemResponse {
  id: string;
  activity_type: "note_completed" | "clinical_report" | "prescription";
  message: string;
  timestamp: string; // ISO datetime string
}

export interface DoctorDashboardResponse {
  doctor_guid: string;
  date: string; // ISO date string (YYYY-MM-DD)
  kpis: DoctorKpiMetrics;
  queue: QueuePatientItem[];
  recent_activities: ActivityItemResponse[];
}

