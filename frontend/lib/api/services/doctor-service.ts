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
};
