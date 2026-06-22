from pydantic import BaseModel, Field

class DoctorCVExtraction(BaseModel):
    name: str = Field(description="The doctor's full name.")
    specialty: str = Field(description="A comma-separated string or concise list identifying the doctor's primary medical specialties or clinical focuses.")
    about: str = Field(description="A clean, professionally written biography summary synthesized from their career background, statement, and experience.")