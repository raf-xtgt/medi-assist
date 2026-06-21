import { API_MDA_PREFIX } from "../constants";
import type { DoctorCreate, DoctorUpdate, DoctorResponse, DoctorPatientRequest, DoctorPatientListItem, PatientAppointmentRequest, PatientReport, DoctorSearchRequest, DoctorSearchResponse } from "../model/doctor.model";

export type { DoctorCreate, DoctorUpdate, DoctorResponse, DoctorPatientRequest, DoctorPatientListItem, PatientAppointmentRequest, PatientReport, DoctorSearchRequest, DoctorSearchResponse };
export type { PatientAppointmentDetail, AppointmentNoteDetail, DoctorSearchResultItem } from "../model/doctor.model";

const ENDPOINT = `${API_MDA_PREFIX}/doctor`;

export const doctorService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch doctors: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorCreate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorUpdate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete doctor: ${res.status}`);
  },

  getPatientList: async (data: DoctorPatientRequest): Promise<DoctorPatientListItem[]> => {
    const res = await fetch(`${ENDPOINT}/patient-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch doctor patient list: ${res.status}`);
    return res.json();
  },

  getPatientReport: async (data: PatientAppointmentRequest): Promise<PatientReport> => {
    const res = await fetch(`${ENDPOINT}/patient-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch patient report: ${res.status}`);
    return res.json();
  },

  search: async (data: DoctorSearchRequest): Promise<DoctorSearchResponse> => {
    const res = await fetch(`${ENDPOINT}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to search doctors: ${res.status}`);
    return res.json();
  },
};
