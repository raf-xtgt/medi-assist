"""Controller for app_mda_doctor_availability endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import DoctorAvailabilityCreate, DoctorAvailabilityUpdate, DoctorAvailabilityResponse
from service.app_mda_doctor_availability_service import doctor_availability_service
from util.database import get_db

router = APIRouter(prefix="/doctor_availability", tags=["app_mda_doctor_availability"])


@router.get("/", response_model=list[DoctorAvailabilityResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return doctor_availability_service.get_all(db, skip=skip, limit=limit)


@router.get("/{guid}", response_model=DoctorAvailabilityResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = doctor_availability_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/", response_model=DoctorAvailabilityResponse, status_code=201)
def create(payload: DoctorAvailabilityCreate, db: Session = Depends(get_db)):
    return doctor_availability_service.create(db, payload.model_dump())


@router.put("/{guid}", response_model=DoctorAvailabilityResponse)
def update(guid: UUID, payload: DoctorAvailabilityUpdate, db: Session = Depends(get_db)):
    obj = doctor_availability_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not doctor_availability_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
