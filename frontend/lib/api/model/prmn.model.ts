export interface PrmnCreate {
  user_guid?: string;
  role?: string;
  status?: string;
}

export interface PrmnUpdate {
  user_guid?: string;
  role?: string;
  status?: string;
}

export interface PrmnResponse {
  guid: string;
  user_guid?: string;
  role?: string;
  created_date?: string;
  status?: string;
}
