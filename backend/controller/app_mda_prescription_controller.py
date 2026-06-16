"""Controller for app_mda_prescription endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import PrescriptionCreate, PrescriptionUpdate, PrescriptionResponse
from service.app_mda_prescription_service import prescription_service
from util.database import get_db

router = APIRouter(prefix="/api/app_mda_prescription", tags=["app_mda_prescription"])


@router.get("/", response_model=list[PrescriptionResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return prescription_service.get_all(db, skip=skip, limit=limit)


@router.get("/{guid}", response_model=PrescriptionResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = prescription_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/", response_model=PrescriptionResponse, status_code=201)
def create(payload: PrescriptionCreate, db: Session = Depends(get_db)):
    return prescription_service.create(db, payload.model_dump())


@router.put("/{guid}", response_model=PrescriptionResponse)
def update(guid: UUID, payload: PrescriptionUpdate, db: Session = Depends(get_db)):
    obj = prescription_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not prescription_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
