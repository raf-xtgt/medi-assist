import { API_MDA_PREFIX } from "../constants";
import type { PatientLeadCreate, PatientLeadUpdate, PatientLeadResponse } from "../model/patient-lead.model";

export type { PatientLeadCreate, PatientLeadUpdate, PatientLeadResponse };

const ENDPOINT = `${API_MDA_PREFIX}/patient-lead`;

export const patientLeadService = {
  getAll: async (skip = 0, limit = 100): Promise<PatientLeadResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch patient leads: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<PatientLeadResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch patient lead: ${res.status}`);
    return res.json();
  },

  create: async (data: PatientLeadCreate): Promise<PatientLeadResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create patient lead: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: PatientLeadUpdate): Promise<PatientLeadResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update patient lead: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete patient lead: ${res.status}`);
  },
};
