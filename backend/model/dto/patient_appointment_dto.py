"""DTOs for patient appointment report endpoint."""

from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel


class PatientAppointmentListingRequestDto(BaseModel):
    doctor_guid: UUID
    patient_guid: UUID


class PatientLatestAppointmentRequestDto(BaseModel):
    patient_guid: UUID


class PatientAppointmentByPatientRequestDto(BaseModel):
    patient_guid: UUID


class PatientAppointmentByPatientDto(BaseModel):
    doctor_guid: Optional[UUID] = None
    patient_guid: UUID
    appointment_guid: Optional[UUID] = None
    appointment_start_time: Optional[datetime] = None
    appointment_end_time: Optional[datetime] = None
    appointment_status: Optional[str] = None
    appointment_running_no: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialty: Optional[str] = None
    doctor_image_url: Optional[str] = None


class PatientAppointmentListingDto(BaseModel):
    doctor_guid: UUID
    patient_guid: UUID
    appointment_guid: Optional[UUID] = None
    appointment_start_time: Optional[datetime] = None
    appointment_end_time: Optional[datetime] = None
    appointment_status: Optional[str]=None 
    appointment_running_no:Optional[str]=None



class PatientAppointmentRequestDto(BaseModel):
    patient_guid: UUID


class AppointmentNoteDto(BaseModel):
    guid: Optional[UUID] = None
    appointment_guid: Optional[UUID] = None
    patient_guid: Optional[UUID] = None
    main_complaint: Optional[str] = None
    blood_pressure: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[Decimal] = None
    respiratory_rate: Optional[int] = None
    oxygen_saturation: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    additional_remarks: Optional[str] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True}


class PatientAppointmentDto(BaseModel):
    appointment_guid: Optional[UUID] = None
    appointment_session_guid: Optional[UUID] = None
    appointment_start_time: Optional[datetime] = None
    appointment_end_time: Optional[datetime] = None
    appointment_session_transcript: Optional[str] = None
    appointment_session_transcript_status: Optional[str] = None
    appointment_session_transcript_metadata: Optional[Any] = None
    appointment_note: Optional[AppointmentNoteDto] = None
    appointment_prescription_medicine_name: Optional[str] = None
    appointment_prescription_dosage: Optional[str] = None
    appointment_prescription_frequency: Optional[str] = None
    appointment_prescription_duration: Optional[str] = None

    model_config = {"from_attributes": True}


class PatientReportDto(BaseModel):
    doctor_guid: Optional[UUID] = None
    clinic_hdr_guid: Optional[UUID] = None
    patient_guid: UUID
    total_appointment_sessions: int = 0
    appointment_detail_list: List[PatientAppointmentDto] = []

    model_config = {"from_attributes": True}
