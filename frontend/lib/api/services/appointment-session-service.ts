import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/appointment_session`;

export interface AppointmentSessionCreate {
  appointment_guid?: string;
  doctor_guid?: string;
  audio_stream_url?: string;
  transcript?: string;
  transcription_status?: string;
  transcript_metadata?: Record<string, unknown>;
  is_reviewed_by_doctor?: boolean;
  status?: string;
}

export interface AppointmentSessionUpdate {
  appointment_guid?: string;
  doctor_guid?: string;
  audio_stream_url?: string;
  transcript?: string;
  transcription_status?: string;
  transcript_metadata?: Record<string, unknown>;
  is_reviewed_by_doctor?: boolean;
  status?: string;
}

export interface AppointmentSessionResponse {
  guid: string;
  appointment_guid?: string;
  doctor_guid?: string;
  audio_stream_url?: string;
  transcript?: string;
  transcription_status?: string;
  transcript_metadata?: Record<string, unknown>;
  is_reviewed_by_doctor?: boolean;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export const appointmentSessionService = {
  getAll: async (skip = 0, limit = 100): Promise<AppointmentSessionResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment sessions: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<AppointmentSessionResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment session: ${res.status}`);
    return res.json();
  },

  create: async (data: AppointmentSessionCreate): Promise<AppointmentSessionResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create appointment session: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: AppointmentSessionUpdate): Promise<AppointmentSessionResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update appointment session: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete appointment session: ${res.status}`);
  },
};
