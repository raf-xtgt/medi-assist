export interface DoctorCredCreate {
  doctor_guid?: string;
  file_matadata?: Record<string, unknown>;
  remarks_1?: string;
  remarks_2?: string;
  remarks_3?: string;
  remarks_4?: string;
  remarks_5?: string;
  status?: string;
}

export interface DoctorCredUpdate {
  doctor_guid?: string;
  file_matadata?: Record<string, unknown>;
  remarks_1?: string;
  remarks_2?: string;
  remarks_3?: string;
  remarks_4?: string;
  remarks_5?: string;
  status?: string;
}

export interface DoctorCredResponse {
  guid: string;
  doctor_guid?: string;
  file_matadata?: Record<string, unknown>;
  remarks_1?: string;
  remarks_2?: string;
  remarks_3?: string;
  remarks_4?: string;
  remarks_5?: string;
  created_date?: string;
  status?: string;
}
