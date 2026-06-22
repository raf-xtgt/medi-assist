import { API_MDA_PREFIX } from "../constants";
import type { LeadChatHdrCreate, LeadChatHdrUpdate, LeadChatHdrResponse } from "../model/lead-chat-hdr.model";

export type { LeadChatHdrCreate, LeadChatHdrUpdate, LeadChatHdrResponse };

const ENDPOINT = `${API_MDA_PREFIX}/lead_chat_hdr`;

const HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export const leadChatHdrService = {
  getAll: async (skip = 0, limit = 100): Promise<LeadChatHdrResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch lead chat headers: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<LeadChatHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch lead chat header: ${res.status}`);
    return res.json();
  },

  create: async (data: LeadChatHdrCreate): Promise<LeadChatHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create lead chat header: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: LeadChatHdrUpdate): Promise<LeadChatHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update lead chat header: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to delete lead chat header: ${res.status}`);
  },
};
