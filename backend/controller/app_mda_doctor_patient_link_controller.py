"""Controller for app_mda_doctor_patient_link endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import DoctorPatientLinkCreate, DoctorPatientLinkUpdate, DoctorPatientLinkResponse
from service.app_mda_doctor_patient_link_service import doctor_patient_link_service
from util.database import get_db

router = APIRouter(prefix="/doctor_patient_link", tags=["app_mda_doctor_patient_link"])


@router.get("/", response_model=list[DoctorPatientLinkResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return doctor_patient_link_service.get_all(db, skip=skip, limit=limit)


@router.get("/{guid}", response_model=DoctorPatientLinkResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = doctor_patient_link_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/", response_model=DoctorPatientLinkResponse, status_code=201)
def create(payload: DoctorPatientLinkCreate, db: Session = Depends(get_db)):
    return doctor_patient_link_service.create(db, payload.model_dump())


@router.put("/{guid}", response_model=DoctorPatientLinkResponse)
def update(guid: UUID, payload: DoctorPatientLinkUpdate, db: Session = Depends(get_db)):
    obj = doctor_patient_link_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not doctor_patient_link_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
