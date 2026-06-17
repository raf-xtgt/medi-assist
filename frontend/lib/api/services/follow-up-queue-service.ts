import { API_BASE_URL } from "../constants";

const ENDPOINT = `${API_BASE_URL}/follow_up_queue`;

export interface FollowUpQueueCreate {
  appointment_guid?: string;
  patient_guid?: string;
  scheduled_cron?: string;
  follow_up_msg?: string;
  follow_up_status?: string;
  status?: string;
}

export interface FollowUpQueueUpdate {
  appointment_guid?: string;
  patient_guid?: string;
  scheduled_cron?: string;
  follow_up_msg?: string;
  follow_up_status?: string;
  status?: string;
}

export interface FollowUpQueueResponse {
  guid: string;
  appointment_guid?: string;
  patient_guid?: string;
  scheduled_cron?: string;
  follow_up_msg?: string;
  follow_up_status?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export const followUpQueueService = {
  getAll: async (skip = 0, limit = 100): Promise<FollowUpQueueResponse[]> => {
    const res = await fetch(`${ENDPOINT}/?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch follow-up queue: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<FollowUpQueueResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch follow-up: ${res.status}`);
    return res.json();
  },

  create: async (data: FollowUpQueueCreate): Promise<FollowUpQueueResponse> => {
    const res = await fetch(`${ENDPOINT}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create follow-up: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: FollowUpQueueUpdate): Promise<FollowUpQueueResponse> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update follow-up: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete follow-up: ${res.status}`);
  },
};
