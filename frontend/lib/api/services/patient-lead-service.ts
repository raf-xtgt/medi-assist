import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/patient_lead`;

export interface PatientLeadCreate {
  phone?: string;
  name?: string;
  lead_status?: string;
  status?: string;
}

export interface PatientLeadUpdate {
  phone?: string;
  name?: string;
  lead_status?: string;
  status?: string;
}

export interface PatientLeadResponse {
  guid: string;
  phone?: string;
  name?: string;
  created_date?: string;
  lead_status?: string;
  status?: string;
}

export const patientLeadService = {
  getAll: async (skip = 0, limit = 100): Promise<PatientLeadResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch patient leads: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<PatientLeadResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch patient lead: ${res.status}`);
    return res.json();
  },

  create: async (data: PatientLeadCreate): Promise<PatientLeadResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create patient lead: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: PatientLeadUpdate): Promise<PatientLeadResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update patient lead: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete patient lead: ${res.status}`);
  },
};
