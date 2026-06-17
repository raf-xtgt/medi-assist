import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/user`;

export interface UserCreate {
  email?: string;
  phone?: string;
  status?: string;
}

export interface UserUpdate {
  email?: string;
  phone?: string;
  status?: string;
}

export interface UserResponse {
  guid: string;
  email?: string;
  phone?: string;
  created_date?: string;
  status?: string;
}

export const userService = {
  getAll: async (skip = 0, limit = 100): Promise<UserResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<UserResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
    return res.json();
  },

  create: async (data: UserCreate): Promise<UserResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: UserUpdate): Promise<UserResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
  },
};
