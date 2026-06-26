export interface DoctorAvailabilityCreate {
  doctor_guid?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  slot_duration_minutes?: number;
  status?: string;
}

export interface DoctorAvailabilityUpdate {
  guid?: string;
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

export interface DoctorCalendarRequest {
  doctor_guid: string;
  start_date: string;  // "YYYY-MM-DD"
  end_date: string;    // "YYYY-MM-DD"
}

export interface DoctorCalendarResponse {
  doctor_guid: string;
  start_date: string;
  end_date: string;
  slot_duration_minutes: number;
  available_dates: Record<string, string[]>;  // ISO date -> array of "HH:MM" times
}
