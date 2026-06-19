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
