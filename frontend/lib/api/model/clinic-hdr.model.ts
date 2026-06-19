export interface ClinicHdrCreate {
  name?: string;
  website_url?: string;
  status?: string;
}

export interface ClinicHdrUpdate {
  name?: string;
  website_url?: string;
  status?: string;
}

export interface ClinicHdrResponse {
  guid: string;
  name?: string;
  website_url?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}
