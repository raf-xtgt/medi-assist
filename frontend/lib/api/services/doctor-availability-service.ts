import { API_MDA_PREFIX } from "../constants";
import type { DoctorAvailabilityCreate, DoctorAvailabilityUpdate, DoctorAvailabilityResponse, DoctorCalendarRequest, DoctorCalendarResponse } from "../model/doctor-availability.model";

export type { DoctorAvailabilityCreate, DoctorAvailabilityUpdate, DoctorAvailabilityResponse, DoctorCalendarRequest, DoctorCalendarResponse };

const ENDPOINT = `${API_MDA_PREFIX}/doctor-availability`;

/** Headers needed to bypass ngrok's browser warning interstitial in dev */
const HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export const doctorAvailabilityService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorAvailabilityResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch doctor availability: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorAvailabilityResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch doctor availability: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorAvailabilityCreate): Promise<DoctorAvailabilityResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor availability: ${res.status}`);
    return res.json();
  },

  multiCreate: async (data: DoctorAvailabilityCreate[]): Promise<DoctorAvailabilityResponse[]> => {
    const res = await fetch(`${ENDPOINT}/multi-create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to multi-create doctor availability: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorAvailabilityUpdate): Promise<DoctorAvailabilityResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor availability: ${res.status}`);
    return res.json();
  },

  multiUpdate: async (data: DoctorAvailabilityUpdate[]): Promise<DoctorAvailabilityResponse[]> => {
    const res = await fetch(`${ENDPOINT}/multi-update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to multi-update doctor availability: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to delete doctor availability: ${res.status}`);
  },

  getByDoctorGuid: async (doctorGuid: string): Promise<DoctorAvailabilityResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-by-doctor/${doctorGuid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch doctor availability: ${res.status}`);
    return res.json();
  },

  getCalendar: async (params: DoctorCalendarRequest): Promise<DoctorCalendarResponse> => {
    const res = await fetch(`${ENDPOINT}/calendar`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Failed to fetch doctor calendar: ${res.status}`);
    return res.json();
  },
};
