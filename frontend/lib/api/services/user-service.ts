import { API_MDA_PREFIX } from "../constants";
import type { UserCreate, UserUpdate, UserResponse } from "../model/user.model";

export type { UserCreate, UserUpdate, UserResponse };

const ENDPOINT = `${API_MDA_PREFIX}/user`;

export const userService = {
  getAll: async (skip = 0, limit = 100): Promise<UserResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<UserResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
    return res.json();
  },

  create: async (data: UserCreate): Promise<UserResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create user: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: UserUpdate): Promise<UserResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status}`);
  },
};
