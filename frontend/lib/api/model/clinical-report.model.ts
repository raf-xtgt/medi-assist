export interface ClinicalReportCreate {
  appointment_session_guid?: string;
  summary?: string;
  key_observations?: string[];
  red_flags?: string[];
  lifestyle_and_diet?: string[];
  care_plan_steps?: string[];
  form_discrepancies?: string[];
  patient_comprehension_rating?: string;
  generated_by?: string;
}

export interface ClinicalReportUpdate {
  appointment_session_guid?: string;
  summary?: string;
  key_observations?: string[];
  red_flags?: string[];
  lifestyle_and_diet?: string[];
  care_plan_steps?: string[];
  form_discrepancies?: string[];
  patient_comprehension_rating?: string;
  generated_by?: string;
}

export interface ClinicalReportResponse {
  guid: string;
  appointment_session_guid?: string;
  summary?: string;
  key_observations?: string[];
  red_flags?: string[];
  lifestyle_and_diet?: string[];
  care_plan_steps?: string[];
  form_discrepancies?: string[];
  patient_comprehension_rating?: string;
  generated_by?: string;
  created_date?: string;
  updated_date?: string;
}
