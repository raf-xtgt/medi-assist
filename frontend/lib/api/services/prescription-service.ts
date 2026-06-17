import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/prescription`;

export interface PrescriptionCreate {
  appointment_guid?: string;
  patient_guid?: string;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  status?: string;
}

export interface PrescriptionUpdate {
  appointment_guid?: string;
  patient_guid?: string;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  status?: string;
}

export interface PrescriptionResponse {
  guid: string;
  appointment_guid?: string;
  patient_guid?: string;
  medicine_name?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export const prescriptionService = {
  getAll: async (skip = 0, limit = 100): Promise<PrescriptionResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch prescriptions: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<PrescriptionResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch prescription: ${res.status}`);
    return res.json();
  },

  create: async (data: PrescriptionCreate): Promise<PrescriptionResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create prescription: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: PrescriptionUpdate): Promise<PrescriptionResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update prescription: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete prescription: ${res.status}`);
  },
};
