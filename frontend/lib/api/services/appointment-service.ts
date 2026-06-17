import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/appointment`;

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

export const appointmentService = {
  getAll: async (skip = 0, limit = 100): Promise<AppointmentResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment: ${res.status}`);
    return res.json();
  },

  create: async (data: AppointmentCreate): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create appointment: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: AppointmentUpdate): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update appointment: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete appointment: ${res.status}`);
  },
};
