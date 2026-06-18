import { API_MDA_PREFIX } from "../constants";

const ENDPOINT = `${API_MDA_PREFIX}/appointment_note`;

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

export const appointmentNoteService = {
  getAll: async (skip = 0, limit = 100): Promise<AppointmentNoteResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment notes: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<AppointmentNoteResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment note: ${res.status}`);
    return res.json();
  },

  create: async (data: AppointmentNoteCreate): Promise<AppointmentNoteResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create appointment note: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: AppointmentNoteUpdate): Promise<AppointmentNoteResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update appointment note: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete appointment note: ${res.status}`);
  },
};
