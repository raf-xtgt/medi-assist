"""Controller for app_mda_appointment_note endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import AppointmentNoteCreate, AppointmentNoteUpdate, AppointmentNoteResponse
from service.app_mda_appointment_note_service import appointment_note_service
from util.database import get_db

router = APIRouter(prefix="/appointment_note", tags=["app_mda_appointment_note"])


@router.get("/get-all", response_model=list[AppointmentNoteResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return appointment_note_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=AppointmentNoteResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = appointment_note_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=AppointmentNoteResponse, status_code=201)
def create(payload: AppointmentNoteCreate, db: Session = Depends(get_db)):
    return appointment_note_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=AppointmentNoteResponse)
def update(guid: UUID, payload: AppointmentNoteUpdate, db: Session = Depends(get_db)):
    obj = appointment_note_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not appointment_note_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
