import { API_MDA_PREFIX } from "../constants";

const ENDPOINT = `${API_MDA_PREFIX}/doctor_patient_link`;

export interface DoctorPatientLinkCreate {
  doctor_guid?: string;
  patient_guid?: string;
  status?: string;
}

export interface DoctorPatientLinkUpdate {
  doctor_guid?: string;
  patient_guid?: string;
  status?: string;
}

export interface DoctorPatientLinkResponse {
  guid: string;
  doctor_guid?: string;
  patient_guid?: string;
  created_date?: string;
  updated_date?: string;
  status?: string;
}

export const doctorPatientLinkService = {
  getAll: async (skip = 0, limit = 100): Promise<DoctorPatientLinkResponse[]> => {
    const res = await fetch(`${ENDPOINT}/get-all?skip=${skip}&limit=${limit}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor-patient links: ${res.status}`);
    return res.json();
  },

  getByGuid: async (guid: string): Promise<DoctorPatientLinkResponse> => {
    const res = await fetch(`${ENDPOINT}/get-by-guid/${guid}`);
    if (!res.ok) throw new Error(`Failed to fetch doctor-patient link: ${res.status}`);
    return res.json();
  },

  create: async (data: DoctorPatientLinkCreate): Promise<DoctorPatientLinkResponse> => {
    const res = await fetch(`${ENDPOINT}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create doctor-patient link: ${res.status}`);
    return res.json();
  },

  update: async (guid: string, data: DoctorPatientLinkUpdate): Promise<DoctorPatientLinkResponse> => {
    const res = await fetch(`${ENDPOINT}/update/${guid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update doctor-patient link: ${res.status}`);
    return res.json();
  },

  delete: async (guid: string): Promise<void> => {
    const res = await fetch(`${ENDPOINT}/delete/${guid}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete doctor-patient link: ${res.status}`);
  },
};
