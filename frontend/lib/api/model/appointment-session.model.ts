export interface AppointmentSessionCreate {
  appointment_guid?: string;
  doctor_guid?: string;
  audio_stream_url?: string;
  transcript?: string;
  transcription_status?: string;
  transcript_metadata?: Record<string, unknown>;
  is_reviewed_by_doctor?: boolean;
  status?: string;
}

export interface AppointmentSessionUpdate {
  appointment_guid?: string;
  doctor_guid?: string;
  audio_stream_url?: string;
  transcript?: string;
  transcription_status?: string;
  transcript_metadata?: Record<string, unknown>;
  is_reviewed_by_doctor?: boolean;
  status?: string;
}

export interface AppointmentSessionResponse {
  guid: string;
  appointment_guid?: string;
  doctor_guid?: string;
  audio_stream_url?: string;
  transcript?: string;
  transcription_status?: string;
  transcript_metadata?: Record<string, unknown>;
  is_reviewed_by_doctor?: boolean;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
