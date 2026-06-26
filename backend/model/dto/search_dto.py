"""DTOs for patient portal search."""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DoctorSearchResult(BaseModel):
    guid: UUID
    name: Optional[str] = None
    specialty: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    about: Optional[str] = None
    image_url: Optional[str] = None
    clinic_hdr_guid: Optional[UUID] = None

    model_config = {"from_attributes": True}


class PatientPortalSearchRequestDto(BaseModel):
    search_string: str


class PatientPortalSearchResultDto(BaseModel):
    search_string: str
    found_doctor: bool
    doctor_results: list[DoctorSearchResult] = []

class PatientPortalSearchDocByNameDto(BaseModel):
    search_string: str
    found_doctor: bool
    doctor_name: str