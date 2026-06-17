import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/clinic_hdr`;

export interface ClinicHdrCreate {
  name?: string;
  website_url?: string;
  status?: string;
}

export interface ClinicHdrUpdate {
  name?: string;
  website_url?: string;
  status?: string;
}

export interface ClinicHdrResponse {
  guid: string;
  name?: string;
  website_url?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export const clinicHdrService = {
  getAll: async (skip = 0, limit = 100): Promise<ClinicHdrResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch clinics: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<ClinicHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch clinic: ${res.status}`);
    return res.json();
  },

  create: async (data: ClinicHdrCreate): Promise<ClinicHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create clinic: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: ClinicHdrUpdate): Promise<ClinicHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update clinic: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete clinic: ${res.status}`);
  },
};
