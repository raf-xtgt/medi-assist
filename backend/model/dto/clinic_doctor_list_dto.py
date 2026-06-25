"""DTO for clinic doctor listing endpoint."""

from uuid import UUID

from pydantic import BaseModel


class ClinicDoctorListRequestDto(BaseModel):
    clinic_guid: UUID


class ClinicDoctorListDto(BaseModel):
    guid: UUID
    user_guid: UUID | None = None
    clinic_hdr_guid: UUID | None = None
    phone: str | None = None
    name: str | None = None
    email: str | None = None
    about: str | None = None
    specialty: str | None = None
    image_url: str | None = None
    created_date: str | None = None
    status: str | None = None

    model_config = {"from_attributes": True}
