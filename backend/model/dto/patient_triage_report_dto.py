"""DTOs for patient triage report endpoint."""

from uuid import UUID

from pydantic import BaseModel


class PatientTriageReportRequestDto(BaseModel):
    lead_guid: UUID


class PatientTriageReportResponseDto(BaseModel):
    lead_guid: UUID
    chat_hdr_guid: UUID
    triage_summary: str
