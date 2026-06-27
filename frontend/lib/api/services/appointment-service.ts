import { API_MDA_PREFIX } from "../constants";
import type { AppointmentCreate, AppointmentUpdate, AppointmentResponse, PatientAppointmentListingRequest, PatientAppointmentListingItem, PatientAppointmentByPatientRequest, PatientAppointmentByPatientItem, PatientLatestAppointmentRequest, DoctorAppointmentPatientRequest, DoctorAppointmentListItem } from "../model/appointment.model";

export type { AppointmentCreate, AppointmentUpdate, AppointmentResponse, PatientAppointmentListingRequest, PatientAppointmentListingItem, PatientAppointmentByPatientRequest, PatientAppointmentByPatientItem, PatientLatestAppointmentRequest, DoctorAppointmentPatientRequest, DoctorAppointmentListItem };

const ENDPOINT = `${API_MDA_PREFIX}/appointment`;

/** Headers needed to bypass ngrok's browser warning interstitial in dev */
const HEADERS: HeadersInit = {
  "ngrok-skip-browser-warning": "true",
};

export const appointmentService = {
  getAll: async (skip = 0, limit = 100): Promise<AppointmentResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch appointment: ${res.status}`);
    return res.json();
  },

  create: async (data: AppointmentCreate): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create appointment: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: AppointmentUpdate): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update appointment: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE", headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to delete appointment: ${res.status}`);
  },

  getAppointmentList: async (data: PatientAppointmentListingRequest): Promise<PatientAppointmentListingItem[]> => {
    const res = await fetch(`${ENDPOINT}/get-appointment-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch appointment list: ${res.status}`);
    return res.json();
  },

  getByPatient: async (data: PatientAppointmentByPatientRequest): Promise<PatientAppointmentByPatientItem[]> => {
    const res = await fetch(`${ENDPOINT}/get-by-patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch patient appointments: ${res.status}`);
    return res.json();
  },

  getLatestPatientAppointment: async (data: PatientLatestAppointmentRequest): Promise<PatientAppointmentByPatientItem> => {
    const res = await fetch(`${ENDPOINT}/latest-appointment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...HEADERS },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch latest patient appointment: ${res.status}`);
    return res.json();
  },

  getByDoctor: async (data: DoctorAppointmentPatientRequest): Promise<DoctorAppointmentListItem[]> => {
    // Route through the Next.js proxy to avoid CORS + ngrok tunnel issues.
    // The proxy calls FastAPI server-side (no browser CORS restrictions).
    const res = await fetch(`/api/mda/appointment/get-by-doctor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch doctor patient list: ${res.status}`);
    return res.json();
  },
};
