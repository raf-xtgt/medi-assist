import { API_MDA_PREFIX } from "../constants";
import type { AppointmentCreate, AppointmentUpdate, AppointmentResponse, PatientAppointmentListingRequest, PatientAppointmentListingItem, PatientAppointmentByPatientRequest, PatientAppointmentByPatientItem } from "../model/appointment.model";

export type { AppointmentCreate, AppointmentUpdate, AppointmentResponse, PatientAppointmentListingRequest, PatientAppointmentListingItem, PatientAppointmentByPatientRequest, PatientAppointmentByPatientItem };

const ENDPOINT = `${API_MDA_PREFIX}/appointment`;

export const appointmentService = {
  getAll: async (skip = 0, limit = 100): Promise<AppointmentResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch appointment: ${res.status}`);
    return res.json();
  },

  create: async (data: AppointmentCreate): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create appointment: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: AppointmentUpdate): Promise<AppointmentResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update appointment: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete appointment: ${res.status}`);
  },

  getAppointmentList: async (data: PatientAppointmentListingRequest): Promise<PatientAppointmentListingItem[]> => {
    const res = await fetch(`${ENDPOINT}/get-appointment-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch appointment list: ${res.status}`);
    return res.json();
  },

  getByPatient: async (data: PatientAppointmentByPatientRequest): Promise<PatientAppointmentByPatientItem[]> => {
    const res = await fetch(`${ENDPOINT}/get-by-patient`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to fetch patient appointments: ${res.status}`);
    return res.json();
  },
};
