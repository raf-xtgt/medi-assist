export interface ClinicHdrCreate {
  name?: string;
  website_url?: string;
  /** Max 100 characters */
  slug?: string;
  site_metadata?: Record<string, unknown>;
  created_by_guid?: string;
  address?: string;
  status?: string;
}

export interface ClinicHdrUpdate {
  name?: string;
  website_url?: string;
  /** Max 100 characters */
  slug?: string;
  site_metadata?: Record<string, unknown>;
  created_by_guid?: string;
  address?: string;
  status?: string;
}

export interface ClinicHdrResponse {
  guid: string;
  name?: string;
  website_url?: string;
  /** Max 100 characters */
  slug?: string;
  site_metadata?: Record<string, unknown>;
  created_by_guid?: string;
  address?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export interface ClinicHdrCriteriaRequest {
  user_guid: string;
}
