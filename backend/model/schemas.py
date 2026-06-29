"""Pydantic schemas for request/response validation."""

from datetime import date, datetime, time
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ─── app_mda_user ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class UserResponse(BaseModel):
    guid: UUID
    email: Optional[str] = None
    phone: Optional[str] = None
    created_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_prmn ────────────────────────────────────────────────────────────

class PrmnCreate(BaseModel):
    user_guid: Optional[UUID] = None
    role: Optional[str] = None
    status: Optional[str] = None


class PrmnUpdate(BaseModel):
    user_guid: Optional[UUID] = None
    role: Optional[str] = None
    status: Optional[str] = None


class PrmnResponse(BaseModel):
    guid: UUID
    user_guid: Optional[UUID] = None
    role: Optional[str] = None
    created_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_clinic_hdr ──────────────────────────────────────────────────────

class ClinicHdrCreate(BaseModel):
    name: Optional[str] = None
    website_url: Optional[str] = None
    slug: Optional[str] = Field(None, max_length=100)  # max 100 characters
    site_metadata: Optional[dict] = None
    created_by_guid: Optional[UUID] = None
    address: Optional[str] = None
    status: Optional[str] = None


class ClinicHdrUpdate(BaseModel):
    name: Optional[str] = None
    website_url: Optional[str] = None
    slug: Optional[str] = Field(None, max_length=100)  # max 100 characters
    site_metadata: Optional[dict] = None
    created_by_guid: Optional[UUID] = None
    address: Optional[str] = None
    status: Optional[str] = None


class ClinicHdrResponse(BaseModel):
    guid: UUID
    name: Optional[str] = None
    website_url: Optional[str] = None
    slug: Optional[str] = Field(None, max_length=100)  # max 100 characters
    site_metadata: Optional[dict] = None
    created_by_guid: Optional[UUID] = None
    address: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_doctor ──────────────────────────────────────────────────────────

class DoctorCreate(BaseModel):
    user_guid: Optional[UUID] = None
    clinic_hdr_guid: Optional[UUID] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    about: Optional[str] = None
    specialty: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None


class DoctorUpdate(BaseModel):
    user_guid: Optional[UUID] = None
    clinic_hdr_guid: Optional[UUID] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    about: Optional[str] = None
    specialty: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = None


class DoctorResponse(BaseModel):
    guid: UUID
    user_guid: Optional[UUID] = None
    clinic_hdr_guid: Optional[UUID] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    about: Optional[str] = None
    specialty: Optional[str] = None
    image_url: Optional[str] = None
    created_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_doctor_cred ─────────────────────────────────────────────────────

class DoctorCredCreate(BaseModel):
    doctor_guid: Optional[UUID] = None
    file_matadata: Optional[Any] = None
    remarks_1: Optional[str] = None
    remarks_2: Optional[str] = None
    remarks_3: Optional[str] = None
    remarks_4: Optional[str] = None
    remarks_5: Optional[str] = None
    status: Optional[str] = None


class DoctorCredUpdate(BaseModel):
    doctor_guid: Optional[UUID] = None
    file_matadata: Optional[Any] = None
    remarks_1: Optional[str] = None
    remarks_2: Optional[str] = None
    remarks_3: Optional[str] = None
    remarks_4: Optional[str] = None
    remarks_5: Optional[str] = None
    status: Optional[str] = None


class DoctorCredResponse(BaseModel):
    guid: UUID
    doctor_guid: Optional[UUID] = None
    file_matadata: Optional[Any] = None
    remarks_1: Optional[str] = None
    remarks_2: Optional[str] = None
    remarks_3: Optional[str] = None
    remarks_4: Optional[str] = None
    remarks_5: Optional[str] = None
    created_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_patient_lead ────────────────────────────────────────────────────

class PatientLeadCreate(BaseModel):
    phone: Optional[str] = None
    name: Optional[str] = None
    lead_status: Optional[str] = None
    status: Optional[str] = None


class PatientLeadUpdate(BaseModel):
    phone: Optional[str] = None
    name: Optional[str] = None
    lead_status: Optional[str] = None
    status: Optional[str] = None


class PatientLeadResponse(BaseModel):
    guid: UUID
    phone: Optional[str] = None
    name: Optional[str] = None
    created_date: Optional[datetime] = None
    lead_status: Optional[str] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_patient ─────────────────────────────────────────────────────────

class PatientCreate(BaseModel):
    lead_guid: Optional[UUID] = None
    user_guid: Optional[UUID] = None
    clinic_hdr_guid: Optional[UUID] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None


class PatientUpdate(BaseModel):
    lead_guid: Optional[UUID] = None
    user_guid: Optional[UUID] = None
    clinic_hdr_guid: Optional[UUID] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None


class PatientResponse(BaseModel):
    guid: UUID
    lead_guid: Optional[UUID] = None
    user_guid: Optional[UUID] = None
    clinic_hdr_guid: Optional[UUID] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_doctor_patient_link ─────────────────────────────────────────────

class DoctorPatientLinkCreate(BaseModel):
    doctor_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    status: Optional[str] = None


class DoctorPatientLinkUpdate(BaseModel):
    doctor_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    status: Optional[str] = None


class DoctorPatientLinkResponse(BaseModel):
    guid: UUID
    doctor_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_doctor_availability ─────────────────────────────────────────────

class DoctorAvailabilityCreate(BaseModel):
    doctor_guid: Optional[UUID] = None
    day_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None
    status: Optional[str] = None


class DoctorAvailabilityUpdate(BaseModel):
    guid: Optional[UUID] = None
    doctor_guid: Optional[UUID] = None
    day_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None
    status: Optional[str] = None


class DoctorAvailabilityResponse(BaseModel):
    guid: UUID
    doctor_guid: Optional[UUID] = None
    day_of_week: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    slot_duration_minutes: Optional[int] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


class DoctorCalendarRequest(BaseModel):
    doctor_guid: UUID
    start_date: date
    end_date: date


class DoctorCalendarResponse(BaseModel):
    doctor_guid: UUID
    start_date: date
    end_date: date
    slot_duration_minutes: int
    available_dates: dict[str, list[str]]


# ─── app_mda_appointment ─────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    clinic_guid: Optional[UUID] = None
    doctor_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    appointment_status: Optional[str] = None
    status: Optional[str] = None


class AppointmentUpdate(BaseModel):
    clinic_guid: Optional[UUID] = None
    doctor_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    appointment_status: Optional[str] = None
    status: Optional[str] = None


class AppointmentResponse(BaseModel):
    guid: UUID
    clinic_guid: Optional[UUID] = None
    doctor_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    appointment_status: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_appointment_session ─────────────────────────────────────────────

class AppointmentSessionCreate(BaseModel):
    appointment_guid: Optional[UUID] = None
    doctor_guid: Optional[UUID] = None
    audio_stream_url: Optional[str] = None
    transcript: Optional[str] = None
    transcription_status: Optional[str] = None
    transcript_metadata: Optional[Any] = None
    is_reviewed_by_doctor: Optional[bool] = None
    status: Optional[str] = None


class AppointmentSessionUpdate(BaseModel):
    appointment_guid: Optional[UUID] = None
    doctor_guid: Optional[UUID] = None
    audio_stream_url: Optional[str] = None
    transcript: Optional[str] = None
    transcription_status: Optional[str] = None
    transcript_metadata: Optional[Any] = None
    is_reviewed_by_doctor: Optional[bool] = None
    status: Optional[str] = None


class AppointmentSessionResponse(BaseModel):
    guid: UUID
    appointment_guid: Optional[UUID] = None
    doctor_guid: Optional[UUID] = None
    audio_stream_url: Optional[str] = None
    transcript: Optional[str] = None
    transcription_status: Optional[str] = None
    transcript_metadata: Optional[Any] = None
    is_reviewed_by_doctor: Optional[bool] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_prescription ────────────────────────────────────────────────────

class PrescriptionCreate(BaseModel):
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    status: Optional[str] = None


class PrescriptionUpdate(BaseModel):
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    status: Optional[str] = None


class PrescriptionResponse(BaseModel):
    guid: UUID
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_follow_up_queue ─────────────────────────────────────────────────

class FollowUpQueueCreate(BaseModel):
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    scheduled_cron: Optional[str] = None
    follow_up_msg: Optional[str] = None
    follow_up_status: Optional[str] = None
    status: Optional[str] = None


class FollowUpQueueUpdate(BaseModel):
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    scheduled_cron: Optional[str] = None
    follow_up_msg: Optional[str] = None
    follow_up_status: Optional[str] = None
    status: Optional[str] = None


class FollowUpQueueResponse(BaseModel):
    guid: UUID
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    scheduled_cron: Optional[str] = None
    follow_up_msg: Optional[str] = None
    follow_up_status: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_appointment_note ────────────────────────────────────────────────

class AppointmentNoteCreate(BaseModel):
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    main_complaint: Optional[str] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    weight: Optional[float] = None
    additional_remarks: Optional[str] = None
    status: Optional[str] = None


class AppointmentNoteUpdate(BaseModel):
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    main_complaint: Optional[str] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    weight: Optional[float] = None
    additional_remarks: Optional[str] = None
    status: Optional[str] = None


class AppointmentNoteResponse(BaseModel):
    guid: UUID
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    main_complaint: Optional[str] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    weight: Optional[float] = None
    additional_remarks: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── app_mda_clinical_report ─────────────────────────────────────────────────

class ClinicalReportCreate(BaseModel):
    appointment_session_guid: Optional[UUID] = None
    summary: Optional[str] = None
    key_observations: Optional[list[str]] = None
    red_flags: Optional[list[str]] = None
    lifestyle_and_diet: Optional[list[str]] = None
    care_plan_steps: Optional[list[str]] = None
    form_discrepancies: Optional[list[str]] = None
    patient_comprehension_rating: Optional[str] = None
    generated_by: Optional[str] = None


class ClinicalReportUpdate(BaseModel):
    appointment_session_guid: Optional[UUID] = None
    summary: Optional[str] = None
    key_observations: Optional[list[str]] = None
    red_flags: Optional[list[str]] = None
    lifestyle_and_diet: Optional[list[str]] = None
    care_plan_steps: Optional[list[str]] = None
    form_discrepancies: Optional[list[str]] = None
    patient_comprehension_rating: Optional[str] = None
    generated_by: Optional[str] = None


class ClinicalReportResponse(BaseModel):
    guid: UUID
    appointment_session_guid: Optional[UUID] = None
    summary: Optional[str] = None
    key_observations: Optional[list[str]] = None
    red_flags: Optional[list[str]] = None
    lifestyle_and_diet: Optional[list[str]] = None
    care_plan_steps: Optional[list[str]] = None
    form_discrepancies: Optional[list[str]] = None
    patient_comprehension_rating: Optional[str] = None
    generated_by: Optional[str] = None
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── app_mda_lead_chat_hdr ───────────────────────────────────────────────────

class LeadChatHdrCreate(BaseModel):
    lead_guid: Optional[UUID] = None
    triage_summary: Optional[str] = None


class LeadChatHdrUpdate(BaseModel):
    lead_guid: Optional[UUID] = None
    triage_summary: Optional[str] = None


class LeadChatHdrResponse(BaseModel):
    guid: UUID
    lead_guid: Optional[UUID] = None
    triage_summary: Optional[str] = None
    created_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── app_mda_lead_chat_transcript ────────────────────────────────────────────

class LeadChatTranscriptCreate(BaseModel):
    chat_hdr_guid: Optional[UUID] = None
    msg_content: Optional[str] = None
    sender: Optional[str] = None


class LeadChatTranscriptUpdate(BaseModel):
    chat_hdr_guid: Optional[UUID] = None
    msg_content: Optional[str] = None
    sender: Optional[str] = None


class LeadChatTranscriptResponse(BaseModel):
    guid: UUID
    chat_hdr_guid: Optional[UUID] = None
    msg_content: Optional[str] = None
    sender: Optional[str] = None
    created_date: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Dashboard Request & Response Models ──────────────────────────────────────

# --- Admin Dashboard ---
class AdminDashboardRequest(BaseModel):
    clinic_guid: UUID
    date: Optional[date] = None  # Defaults to current date if not provided

class AdminKpiMetrics(BaseModel):
    total_appointments: int
    remaining_appointments: int
    completed_appointments: int
    completion_rate: float
    canceled_or_postponed_appointments: int
    average_utilization_rate: float

class DoctorLoadItem(BaseModel):
    doctor_guid: UUID
    doctor_name: str
    specialty: str
    completed_appointments: int
    total_appointments: int
    utilization_percentage: float

class AdminAppointmentItem(BaseModel):
    appointment_guid: UUID
    time: str  # Format: "HH:MM"
    patient_name: str
    doctor_name: str
    visit_type: str  # derived from appointment_note.main_complaint or triage summary
    appointment_status: str

class AdminDashboardResponse(BaseModel):
    clinic_guid: UUID
    date: date
    kpis: AdminKpiMetrics
    provider_loads: list[DoctorLoadItem]
    appointments: list[AdminAppointmentItem]


# --- Doctor Dashboard ---
class DoctorDashboardRequest(BaseModel):
    doctor_guid: UUID
    date: Optional[date] = None  # Defaults to current date if not provided

class DoctorKpiMetrics(BaseModel):
    patients_today: int
    patients_remaining: int
    total_appointments: int
    next_appointment_time: Optional[str] = None  # Format: "HH:MM"
    pending_notes: int  # count of sessions where is_reviewed_by_doctor is False
    avg_consult_duration_minutes: float

class QueuePatientItem(BaseModel):
    patient_guid: UUID
    patient_name: str
    age: int
    appointment_guid: UUID
    scheduled_start: datetime
    reason: str  # from lead_chat_hdr.triage_summary or appointment_note.main_complaint
    appointment_status: str

class ActivityItemResponse(BaseModel):
    id: str
    activity_type: str  # "note_completed", "clinical_report", "prescription"
    message: str
    timestamp: datetime

class DoctorDashboardResponse(BaseModel):
    doctor_guid: UUID
    date: date
    kpis: DoctorKpiMetrics
    queue: list[QueuePatientItem]
    recent_activities: list[ActivityItemResponse]

