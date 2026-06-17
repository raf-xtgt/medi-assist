"""Controller for app_mda_patient_lead endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import PatientLeadCreate, PatientLeadUpdate, PatientLeadResponse
from service.app_mda_patient_lead_service import patient_lead_service
from util.database import get_db

router = APIRouter(prefix="/patient-lead", tags=["app_mda_patient_lead"])


@router.get("/get-all", response_model=list[PatientLeadResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return patient_lead_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=PatientLeadResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = patient_lead_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=PatientLeadResponse, status_code=201)
def create(payload: PatientLeadCreate, db: Session = Depends(get_db)):
    return patient_lead_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=PatientLeadResponse)
def update(guid: UUID, payload: PatientLeadUpdate, db: Session = Depends(get_db)):
    obj = patient_lead_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not patient_lead_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
