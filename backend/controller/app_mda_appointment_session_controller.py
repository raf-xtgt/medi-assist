"""Controller for app_mda_appointment_session endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import AppointmentSessionCreate, AppointmentSessionUpdate, AppointmentSessionResponse
from service.app_mda_appointment_session_service import appointment_session_service
from util.database import get_db

router = APIRouter(prefix="/appointment_session", tags=["app_mda_appointment_session"])


@router.get("/get-all", response_model=list[AppointmentSessionResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return appointment_session_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=AppointmentSessionResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = appointment_session_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=AppointmentSessionResponse, status_code=201)
def create(payload: AppointmentSessionCreate, db: Session = Depends(get_db)):
    return appointment_session_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=AppointmentSessionResponse)
def update(guid: UUID, payload: AppointmentSessionUpdate, db: Session = Depends(get_db)):
    obj = appointment_session_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not appointment_session_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
