import { API_MDA_PREFIX } from "../constants";
import type { AdminDashboardResponse, DoctorDashboardResponse } from "../model/dashboard.model";

const ENDPOINT = `${API_MDA_PREFIX}/dashboard`;

const HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export const dashboardService = {
  getAdminDashboard: async (clinicGuid: string, dateStr?: string): Promise<AdminDashboardResponse> => {
    let url = `${ENDPOINT}/admin?clinic_guid=${clinicGuid}`;
    if (dateStr) {
      url += `&query_date=${dateStr}`;
    }
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch admin dashboard: ${res.status}`);
    return res.json();
  },

  getDoctorDashboard: async (doctorGuid: string, dateStr?: string): Promise<DoctorDashboardResponse> => {
    let url = `${ENDPOINT}/doctor?doctor_guid=${doctorGuid}`;
    if (dateStr) {
      url += `&query_date=${dateStr}`;
    }
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch doctor dashboard: ${res.status}`);
    return res.json();
  },
};
