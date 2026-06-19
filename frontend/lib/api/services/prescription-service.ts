import { API_MDA_PREFIX } from "../constants";
import type { PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse } from "../model/prescription.model";

export type { PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse };

const ENDPOINT = `${API_MDA_PREFIX}/prescription`;

export const prescriptionService = {
  getAll: async (skip = 0, limit = 100): Promise<PrescriptionResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch prescriptions: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<PrescriptionResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch prescription: ${res.status}`);
    return res.json();
  },

  create: async (data: PrescriptionCreate): Promise<PrescriptionResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create prescription: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: PrescriptionUpdate): Promise<PrescriptionResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update prescription: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete prescription: ${res.status}`);
  },
};
