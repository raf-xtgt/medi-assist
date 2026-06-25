import { API_BASE_URL, API_MDA_PREFIX } from "../constants";
import type { ClinicHdrCreate, ClinicHdrUpdate, ClinicHdrResponse, ClinicHdrCriteriaRequest, ClinicDoctorListRequest } from "../model/clinic-hdr.model";
import type { DoctorResponse } from "../model/doctor.model";

export type { ClinicHdrCreate, ClinicHdrUpdate, ClinicHdrResponse, ClinicHdrCriteriaRequest, ClinicDoctorListRequest };

const ENDPOINT = `${API_MDA_PREFIX}/clinic-hdr`;
const PUBLIC_ENDPOINT = `${API_BASE_URL}/api/public/clinic`;

export const clinicHdrService = {
  getAll: async (skip = 0, limit = 100): Promise<ClinicHdrResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch clinics: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<ClinicHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch clinic: ${res.status}`);
    return res.json();
  },

  getBySlug: async (slug: string): Promise<ClinicHdrResponse> => {
    const res = await fetch(`${PUBLIC_ENDPOINT}/${slug}`);
    if (!res.ok) throw new Error(`Failed to fetch clinic by slug: ${res.status}`);
    return res.json();
  },

  getByCriteria: async (data: ClinicHdrCriteriaRequest): Promise<ClinicHdrResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-by-criteria`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch clinics by criteria: ${res.status}`);
    return res.json();
  },

  create: async (data: ClinicHdrCreate): Promise<ClinicHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create clinic: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: ClinicHdrUpdate): Promise<ClinicHdrResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update clinic: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete clinic: ${res.status}`);
  },

  getClinicDoctors: async (data: ClinicDoctorListRequest): Promise<DoctorResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-clinic-doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch clinic doctors: ${res.status}`);
    return res.json();
  },
};
