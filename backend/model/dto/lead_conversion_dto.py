"""DTOs for patient lead conversion."""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class PatientLeadConversionRequestDto(BaseModel):
    doctor_guid: UUID
    lead_guid: UUID


class PatientLeadConversionResponseDto(BaseModel):
    patient_guid: UUID
    doctor_patient_link_guid: UUID
    lead_guid: UUID
    doctor_guid: UUID

    model_config = {"from_attributes": True}
