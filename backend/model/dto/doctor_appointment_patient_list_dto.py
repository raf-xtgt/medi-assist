"""DTOs for doctor-patient listing endpoint."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DoctorAppointmentPatientRequestDto(BaseModel):
    doctor_guid: UUID
    

class DoctorAppointmentListDto(BaseModel):
    doctor_guid: UUID
    patient_guid: UUID
    patient_phone: Optional[str] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    patient_address: Optional[str] = None
    patient_triage_summary: Optional[str] = None
    # Appointment fields (one row per appointment)
    appointment_guid: Optional[UUID] = None
    appointment_status: Optional[str] = None
    running_no: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None

    model_config = {"from_attributes": True}
