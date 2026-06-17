import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/doctor_cred`;

export interface DoctorCredCreate {
  doctor_guid?: string;
  file_matadata?: Record<string, unknown>;
  remarks_1?: string;
  remarks_2?: string;
  remarks_3?: string;
  remarks_4?: string;
  remarks_5?: string;
  status?: string;
}

export interface DoctorCredUpdate {
  doctor_guid?: string;
  file_matadata?: Record<string, unknown>;
  remarks_1?: string;
  remarks_2?: string;
  remarks_3?: string;
  remarks_4?: string;
  remarks_5?: string;
  status?: string;
}

export interface DoctorCredResponse {
  guid: string;
  doctor_guid?: string;
  file_matadata?: Record<string, unknown>;
  remarks_1?: string;
  remarks_2?: string;
  remarks_3?: string;
  remarks_4?: string;
  remarks_5?: string;
  created_date?: string;
  status?: string;
}

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
