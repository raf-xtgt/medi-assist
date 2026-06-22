import { API_MDA_PREFIX } from "../constants";
import type { LeadChatTranscriptCreate, LeadChatTranscriptUpdate, LeadChatTranscriptResponse } from "../model/lead-chat-transcript.model";

export type { LeadChatTranscriptCreate, LeadChatTranscriptUpdate, LeadChatTranscriptResponse };

const ENDPOINT = `${API_MDA_PREFIX}/lead_chat_transcript`;

const HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export const leadChatTranscriptService = {
  getAll: async (skip = 0, limit = 100): Promise<LeadChatTranscriptResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch lead chat transcripts: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<LeadChatTranscriptResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch lead chat transcript: ${res.status}`);
    return res.json();
  },

  getByChatHdr: async (chatHdrGuid: string): Promise<LeadChatTranscriptResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-by-chat-hdr/${chatHdrGuid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch transcripts by chat header: ${res.status}`);
    return res.json();
  },

  create: async (data: LeadChatTranscriptCreate): Promise<LeadChatTranscriptResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create lead chat transcript: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: LeadChatTranscriptUpdate): Promise<LeadChatTranscriptResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update lead chat transcript: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to delete lead chat transcript: ${res.status}`);
  },
};
