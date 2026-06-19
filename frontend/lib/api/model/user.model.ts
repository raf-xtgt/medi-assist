export interface UserCreate {
  email?: string;
  phone?: string;
  status?: string;
}

export interface UserUpdate {
  email?: string;
  phone?: string;
  status?: string;
}

export interface UserResponse {
  guid: string;
  email?: string;
  phone?: string;
  created_date?: string;
  status?: string;
}
