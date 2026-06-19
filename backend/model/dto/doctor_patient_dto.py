"""DTOs for doctor-patient listing endpoint."""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DoctorPatientRequestDto(BaseModel):
    doctor_guid: UUID
    clinic_hdr_guid: UUID


class DoctorPatientListDto(BaseModel):
    doctor_guid: UUID
    clinic_hdr_guid: UUID
    patient_guid: UUID
    patient_phone: Optional[str] = None
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None
    patient_address: Optional[str] = None
    total_completed_appointments: int = 0

    model_config = {"from_attributes": True}
