"""DTOs for triage chat endpoint."""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel

from model.schemas import LeadChatTranscriptCreate


class TriageRequestDto(BaseModel):
    chat_hdr_guid: Optional[UUID] = None
    transcripts: List[LeadChatTranscriptCreate]
    combined_user_msg: str


class TriageResponseDto(BaseModel):
    response_text: str
    booking_flag: bool = False
