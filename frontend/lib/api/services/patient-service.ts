import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/patient`;

export interface PatientCreate {
  lead_guid?: string;
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  status?: string;
}

export interface PatientUpdate {
  lead_guid?: string;
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  status?: string;
}

export interface PatientResponse {
  guid: string;
  lead_guid?: string;
  user_guid?: string;
  clinic_hdr_guid?: string;
  phone?: string;
  name?: string;
  email?: string;
  address?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export const patientService = {
  getAll: async (skip = 0, limit = 100): Promise<PatientResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<PatientResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch patient: ${res.status}`);
    return res.json();
  },

  create: async (data: PatientCreate): Promise<PatientResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create patient: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: PatientUpdate): Promise<PatientResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update patient: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete patient: ${res.status}`);
  },
};
