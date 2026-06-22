"""Controller for app_mda_lead_chat_transcript endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import LeadChatTranscriptCreate, LeadChatTranscriptUpdate, LeadChatTranscriptResponse
from service.app_mda_lead_chat_transcript_service import lead_chat_transcript_service
from util.database import get_db

router = APIRouter(prefix="/lead_chat_transcript", tags=["app_mda_lead_chat_transcript"])


@router.get("/get-all", response_model=list[LeadChatTranscriptResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return lead_chat_transcript_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=LeadChatTranscriptResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = lead_chat_transcript_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.get("/get-by-chat-hdr/{chat_hdr_guid}", response_model=list[LeadChatTranscriptResponse])
def get_by_chat_hdr(chat_hdr_guid: UUID, db: Session = Depends(get_db)):
    """Get all transcript messages for a given chat header, ordered by created_date."""
    from model.app_mda_lead_chat_transcript import AppMdaLeadChatTranscript
    results = (
        db.query(AppMdaLeadChatTranscript)
        .filter(AppMdaLeadChatTranscript.chat_hdr_guid == chat_hdr_guid)
        .order_by(AppMdaLeadChatTranscript.created_date.asc())
        .all()
    )
    return results


@router.post("/create", response_model=LeadChatTranscriptResponse, status_code=201)
def create(payload: LeadChatTranscriptCreate, db: Session = Depends(get_db)):
    return lead_chat_transcript_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=LeadChatTranscriptResponse)
def update(guid: UUID, payload: LeadChatTranscriptUpdate, db: Session = Depends(get_db)):
    obj = lead_chat_transcript_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not lead_chat_transcript_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
