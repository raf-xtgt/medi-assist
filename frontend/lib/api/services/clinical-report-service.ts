import { API_MDA_PREFIX } from "../constants";
import type { ClinicalReportCreate, ClinicalReportUpdate, ClinicalReportResponse } from "../model/clinical-report.model";

export type { ClinicalReportCreate, ClinicalReportUpdate, ClinicalReportResponse };

const ENDPOINT = `${API_MDA_PREFIX}/clinical_report`;

/** Headers needed to bypass ngrok's browser warning interstitial in dev */
const HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export const clinicalReportService = {
  getAll: async (skip = 0, limit = 100): Promise<ClinicalReportResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch clinical reports: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<ClinicalReportResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch clinical report: ${res.status}`);
    return res.json();
  },

  getBySession: async (appointmentSessionGuid: string): Promise<ClinicalReportResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-by-session/${appointmentSessionGuid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch clinical reports by session: ${res.status}`);
    return res.json();
  },

  create: async (data: ClinicalReportCreate): Promise<ClinicalReportResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create clinical report: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: ClinicalReportUpdate): Promise<ClinicalReportResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update clinical report: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to delete clinical report: ${res.status}`);
  },
};
