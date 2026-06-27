"""DTO for doctor image upload response."""

from uuid import UUID

from pydantic import BaseModel


class DoctorImageUploadResponse(BaseModel):
    """Response returned after successfully uploading a doctor's profile image."""

    doctor_guid: UUID
    image_url: str
    blob_path: str
