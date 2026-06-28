"""DTOs for doctor get-by-criteria endpoint."""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DoctorByCriteriaRequestDto(BaseModel):
    clinic_hdr_guid: UUID


class DoctorByCriteriaItemDto(BaseModel):
    guid: UUID
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    specialty: Optional[str] = None
    image_url: Optional[str] = None
    clinic_name: Optional[str] = None

    model_config = {"from_attributes": True}
