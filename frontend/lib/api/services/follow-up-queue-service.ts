import { API_MDA_PREFIX } from "../constants";
import type { FollowUpQueueCreate, FollowUpQueueUpdate, FollowUpQueueResponse } from "../model/follow-up-queue.model";

export type { FollowUpQueueCreate, FollowUpQueueUpdate, FollowUpQueueResponse };

const ENDPOINT = `${API_MDA_PREFIX}/follow_up_queue`;

export const followUpQueueService = {
  getAll: async (skip = 0, limit = 100): Promise<FollowUpQueueResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch follow-up queue: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<FollowUpQueueResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch follow-up: ${res.status}`);
    return res.json();
  },

  create: async (data: FollowUpQueueCreate): Promise<FollowUpQueueResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create follow-up: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: FollowUpQueueUpdate): Promise<FollowUpQueueResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update follow-up: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete follow-up: ${res.status}`);
  },
};
