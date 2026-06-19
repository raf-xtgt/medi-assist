"""DTOs for patient appointment report endpoint."""

from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel


class PatientAppointmentRequestDto(BaseModel):
    patient_guid: UUID


class PatientAppointmentDto(BaseModel):
    appointment_guid: Optional[UUID] = None
    appointment_start_time: Optional[datetime] = None
    appointment_end_time: Optional[datetime] = None
    appointment_session_transcript: Optional[str] = None
    appointment_session_transcript_status: Optional[str] = None
    appointment_session_transcript_metadata: Optional[Any] = None
    appointment_note: Optional[str] = None
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
