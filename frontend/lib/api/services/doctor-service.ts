import { API_MDA_PREFIX } from "../constants";
import type { DoctorCreate, DoctorUpdate, DoctorResponse, DoctorPatientRequest, DoctorPatientListItem, PatientAppointmentRequest, PatientReport, DoctorSearchRequest, DoctorSearchResponse, DoctorSearchByNameRequest, DoctorSearchByNameResponse } from "../model/doctor.model";
import type { DoctorCVExtractionResponse } from "../model/clinic-hdr.model";

export type { DoctorCreate, DoctorUpdate, DoctorResponse, DoctorPatientRequest, DoctorPatientListItem, PatientAppointmentRequest, PatientReport, DoctorSearchRequest, DoctorSearchResponse, DoctorSearchByNameRequest, DoctorSearchByNameResponse };
export type { PatientAppointmentDetail, AppointmentNoteDetail, DoctorSearchResultItem } from "../model/doctor.model";
export type { DoctorCVExtractionResponse } from "../model/clinic-hdr.model";

const ENDPOINT = `${API_MDA_PREFIX}/doctor`;

/** Headers needed to bypass ngrok's browser warning interstitial in dev */
const HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export const doctorService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch doctors: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch doctor: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorCreate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorUpdate): Promise<DoctorResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to delete doctor: ${res.status}`);
  },

  getPatientList: async (data: DoctorPatientRequest): Promise<DoctorPatientListItem[]> => {
    const res = await fetch(`${ENDPOINT}/patient-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch doctor patient list: ${res.status}`);
    return res.json();
  },

  getPatientReport: async (data: PatientAppointmentRequest): Promise<PatientReport> => {
    const res = await fetch(`${ENDPOINT}/patient-report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch patient report: ${res.status}`);
    return res.json();
  },

  search: async (data: DoctorSearchRequest): Promise<DoctorSearchResponse> => {
    const res = await fetch(`${ENDPOINT}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to search doctors: ${res.status}`);
    return res.json();
  },

  searchByDocName: async (data: DoctorSearchByNameRequest): Promise<DoctorSearchByNameResponse> => {
    const res = await fetch(`${ENDPOINT}/search-doc-by-name`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to search doctor by name: ${res.status}`);
    return res.json();
  },

  triggerFileIngestion: async (doctorGuid: string, file: File): Promise<DoctorCVExtractionResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${ENDPOINT}/upload-cv/${doctorGuid}`, {
      method: "POST",
      headers: { ...HEADERS },
      body: formData,
    });
    if (!res.ok) throw new Error(`Failed to upload doctor CV: ${res.status}`);
    return res.json();
  },
};
