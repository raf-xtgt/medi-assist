"""Controller for app_mda_appointment endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from service.app_mda_appointment_service import appointment_service
from util.database import get_db

router = APIRouter(prefix="/appointment", tags=["app_mda_appointment"])


@router.get("/", response_model=list[AppointmentResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return appointment_service.get_all(db, skip=skip, limit=limit)


@router.get("/{guid}", response_model=AppointmentResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = appointment_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/", response_model=AppointmentResponse, status_code=201)
def create(payload: AppointmentCreate, db: Session = Depends(get_db)):
    return appointment_service.create(db, payload.model_dump())


@router.put("/{guid}", response_model=AppointmentResponse)
def update(guid: UUID, payload: AppointmentUpdate, db: Session = Depends(get_db)):
    obj = appointment_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not appointment_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
