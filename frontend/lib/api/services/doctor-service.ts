import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/doctor`;

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

export const doctorService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch doctors: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorCreate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorUpdate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete doctor: ${res.status}`);
  },
};
