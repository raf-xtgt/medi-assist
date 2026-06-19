import { API_MDA_PREFIX } from "../constants";
import type { AppointmentSessionCreate, AppointmentSessionUpdate, AppointmentSessionResponse } from "../model/appointment-session.model";

export type { AppointmentSessionCreate, AppointmentSessionUpdate, AppointmentSessionResponse };

const ENDPOINT = `${API_MDA_PREFIX}/appointment_session`;

export const appointmentSessionService = {
  getAll: async (skip = 0, limit = 100): Promise<AppointmentSessionResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment sessions: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<AppointmentSessionResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment session: ${res.status}`);
    return res.json();
  },

  create: async (data: AppointmentSessionCreate): Promise<AppointmentSessionResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create appointment session: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: AppointmentSessionUpdate): Promise<AppointmentSessionResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update appointment session: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete appointment session: ${res.status}`);
  },
};
