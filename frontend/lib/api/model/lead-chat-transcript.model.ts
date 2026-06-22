export interface LeadChatTranscriptCreate {
  chat_hdr_guid?: string;
  msg_content?: string;
  sender?: string;
}

export interface LeadChatTranscriptUpdate {
  chat_hdr_guid?: string;
  msg_content?: string;
  sender?: string;
}

export interface LeadChatTranscriptResponse {
  guid: string;
  chat_hdr_guid?: string;
  msg_content?: string;
  sender?: string;
  created_date?: string;
}
