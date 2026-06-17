import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/prmn`;

export interface PrmnCreate {
  user_guid?: string;
  role?: string;
  status?: string;
}

export interface PrmnUpdate {
  user_guid?: string;
  role?: string;
  status?: string;
}

export interface PrmnResponse {
  guid: string;
  user_guid?: string;
  role?: string;
  created_date?: string;
  status?: string;
}

export const prmnService = {
  getAll: async (skip = 0, limit = 100): Promise<PrmnResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch permissions: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<PrmnResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch permission: ${res.status}`);
    return res.json();
  },

  create: async (data: PrmnCreate): Promise<PrmnResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create permission: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: PrmnUpdate): Promise<PrmnResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update permission: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete permission: ${res.status}`);
  },
};
