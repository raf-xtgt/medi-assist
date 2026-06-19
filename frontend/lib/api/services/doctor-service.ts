import { API_MDA_PREFIX } from "../constants";

const ENDPOINT = `${API_MDA_PREFIX}/doctor`;

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

export interface PatientAppointmentDetail {
  appointment_guid?: string;
  appointment_start_time?: string;
  appointment_end_time?: string;
  appointment_session_transcript?: string;
  appointment_session_transcript_status?: string;
  appointment_session_transcript_metadata?: Record<string, unknown>;
  appointment_note?: string;
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

export const doctorService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch doctors: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorCreate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorUpdate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete doctor: ${res.status}`);
  },

  getPatientList: async (data: DoctorPatientRequest): Promise<DoctorPatientListItem[]> => {
    const res = await fetch(`${ENDPOINT}/patient-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch doctor patient list: ${res.status}`);
    return res.json();
  },

  getPatientReport: async (data: PatientAppointmentRequest): Promise<PatientReport> => {
    const res = await fetch(`${ENDPOINT}/patient-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch patient report: ${res.status}`);
    return res.json();
  },
};
