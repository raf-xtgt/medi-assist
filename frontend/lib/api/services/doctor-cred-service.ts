import { API_MDA_PREFIX } from "../constants";
import type { DoctorCredCreate, DoctorCredUpdate, DoctorCredResponse } from "../model/doctor-cred.model";

export type { DoctorCredCreate, DoctorCredUpdate, DoctorCredResponse };

const ENDPOINT = `${API_MDA_PREFIX}/doctor_cred`;

export const doctorCredService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorCredResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor credentials: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorCredResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor credential: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorCredCreate): Promise<DoctorCredResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor credential: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorCredUpdate): Promise<DoctorCredResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor credential: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete doctor credential: ${res.status}`);
  },
};
