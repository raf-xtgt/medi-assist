export interface TriageTranscriptItem {
  chat_hdr_guid?: string;
  msg_content?: string;
  sender?: string;
}

export interface TriageRequest {
  chat_hdr_guid?: string;
  transcripts: TriageTranscriptItem[];
  combined_user_msg: string;
}

export interface TriageResponse {
  response_text: string;
  booking_flag: boolean;
  recommended_doctor_name?: string;
}
