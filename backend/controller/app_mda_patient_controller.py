"""Controller for app_mda_patient endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import PatientCreate, PatientUpdate, PatientResponse
from service.app_mda_patient_service import patient_service
from util.database import get_db

router = APIRouter(prefix="/patient", tags=["app_mda_patient"])


@router.get("/", response_model=list[PatientResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return patient_service.get_all(db, skip=skip, limit=limit)


@router.get("/{guid}", response_model=PatientResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = patient_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/", response_model=PatientResponse, status_code=201)
def create(payload: PatientCreate, db: Session = Depends(get_db)):
    return patient_service.create(db, payload.model_dump())


@router.put("/{guid}", response_model=PatientResponse)
def update(guid: UUID, payload: PatientUpdate, db: Session = Depends(get_db)):
    obj = patient_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not patient_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
