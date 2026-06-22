export interface LeadChatHdrCreate {
  lead_guid?: string;
  triage_summary?: string;
}

export interface LeadChatHdrUpdate {
  lead_guid?: string;
  triage_summary?: string;
}

export interface LeadChatHdrResponse {
  guid: string;
  lead_guid?: string;
  triage_summary?: string;
  created_date?: string;
}
