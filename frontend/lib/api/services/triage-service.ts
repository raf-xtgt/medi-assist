import { API_BASE_URL } from "../constants";
import type { TriageRequest, TriageResponse } from "../model/triage.model";

export type { TriageRequest, TriageResponse };

const ENDPOINT = `${API_BASE_URL}/api/agent/triage`;

export const triageService = {
  triggerChat: async (data: TriageRequest): Promise<TriageResponse> => {
    const res = await fetch(`${ENDPOINT}/trigger-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to trigger triage chat: ${res.status}`);
    return res.json();
  },
};
