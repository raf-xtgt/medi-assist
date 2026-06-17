"""Controller for app_mda_doctor endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import DoctorCreate, DoctorUpdate, DoctorResponse
from service.app_mda_doctor_service import doctor_service
from util.database import get_db

router = APIRouter(prefix="/doctor", tags=["app_mda_doctor"])


@router.get("/get-all", response_model=list[DoctorResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return doctor_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=DoctorResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = doctor_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=DoctorResponse, status_code=201)
def create(payload: DoctorCreate, db: Session = Depends(get_db)):
    return doctor_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=DoctorResponse)
def update(guid: UUID, payload: DoctorUpdate, db: Session = Depends(get_db)):
    obj = doctor_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not doctor_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
