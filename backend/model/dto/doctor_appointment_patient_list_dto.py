"""DTOs for doctor-patient listing endpoint."""

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
    patient_triage_summary: Optional[str]=None

    model_config = {"from_attributes": True}
