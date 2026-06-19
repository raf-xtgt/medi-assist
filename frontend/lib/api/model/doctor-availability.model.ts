export interface DoctorAvailabilityCreate {
  doctor_guid?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  status?: string;
}

export interface DoctorAvailabilityUpdate {
  doctor_guid?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  status?: string;
}

export interface DoctorAvailabilityResponse {
  guid: string;
  doctor_guid?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
