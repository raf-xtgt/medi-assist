import { API_MDA_PREFIX } from "../constants";
import type { PatientCreate, PatientUpdate, PatientResponse } from "../model/patient.model";
import type { PatientOnlyHistoryRequest, PatientHistoryResponse } from "../model/patient-history.model";

export type { PatientCreate, PatientUpdate, PatientResponse, PatientOnlyHistoryRequest, PatientHistoryResponse };

const ENDPOINT = `${API_MDA_PREFIX}/patient`;

export const patientService = {
  getAll: async (skip = 0, limit = 100): Promise<PatientResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch patients: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<PatientResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch patient: ${res.status}`);
    return res.json();
  },

  create: async (data: PatientCreate): Promise<PatientResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create patient: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: PatientUpdate): Promise<PatientResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update patient: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete patient: ${res.status}`);
  },

  getHistory: async (data: PatientOnlyHistoryRequest): Promise<PatientHistoryResponse> => {
    const res = await fetch(`${ENDPOINT}/get-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch patient history: ${res.status}`);
    return res.json();
  },
};
