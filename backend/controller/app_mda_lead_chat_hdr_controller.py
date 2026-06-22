"""Controller for app_mda_lead_chat_hdr endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import LeadChatHdrCreate, LeadChatHdrUpdate, LeadChatHdrResponse
from service.app_mda_lead_chat_hdr_service import lead_chat_hdr_service
from util.database import get_db

router = APIRouter(prefix="/lead_chat_hdr", tags=["app_mda_lead_chat_hdr"])


@router.get("/get-all", response_model=list[LeadChatHdrResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return lead_chat_hdr_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=LeadChatHdrResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = lead_chat_hdr_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=LeadChatHdrResponse, status_code=201)
def create(payload: LeadChatHdrCreate, db: Session = Depends(get_db)):
    return lead_chat_hdr_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=LeadChatHdrResponse)
def update(guid: UUID, payload: LeadChatHdrUpdate, db: Session = Depends(get_db)):
    obj = lead_chat_hdr_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not lead_chat_hdr_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
