import { API_MDA_PREFIX } from "../constants";

const ENDPOINT = `${API_MDA_PREFIX}/doctor_availability`;

export interface DoctorAvailabilityCreate {
  doctor_guid?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  status?: string;
}

export interface DoctorAvailabilityUpdate {
  doctor_guid?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  status?: string;
}

export interface DoctorAvailabilityResponse {
  guid: string;
  doctor_guid?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export const doctorAvailabilityService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorAvailabilityResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor availability: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorAvailabilityResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor availability: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorAvailabilityCreate): Promise<DoctorAvailabilityResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor availability: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorAvailabilityUpdate): Promise<DoctorAvailabilityResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor availability: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete doctor availability: ${res.status}`);
  },
};
