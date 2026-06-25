"""Controller for app_mda_clinic_hdr endpoints."""

from uuid import UUID
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session

from model.schemas import ClinicHdrCreate, ClinicHdrUpdate, ClinicHdrResponse, DoctorResponse
from model.dto.clinic_doctor_list_dto import ClinicDoctorListRequestDto
from service.app_mda_clinic_hdr_service import clinic_hdr_service
from util.database import get_db

router = APIRouter(prefix="/clinic-hdr", tags=["app_mda_clinic_hdr"])


@router.get("/get-all", response_model=list[ClinicHdrResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return clinic_hdr_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=ClinicHdrResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = clinic_hdr_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=ClinicHdrResponse, status_code=201)
def create(payload: ClinicHdrCreate, db: Session = Depends(get_db)):
    return clinic_hdr_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=ClinicHdrResponse)
def update(guid: UUID, payload: ClinicHdrUpdate, db: Session = Depends(get_db)):
    obj = clinic_hdr_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not clinic_hdr_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")


# Request/Response schemas for get-by-criteria
class ClinicHdrCriteriaRequest(BaseModel):
    user_guid: UUID


@router.post("/get-by-criteria", response_model=list[ClinicHdrResponse])
def get_by_criteria(payload: ClinicHdrCriteriaRequest, db: Session = Depends(get_db)):
    return clinic_hdr_service.get_by_criteria(db, payload.user_guid, limit=100)


@router.post("/get-clinic-doctors", response_model=list[DoctorResponse])
def get_clinic_doctors(payload: ClinicDoctorListRequestDto, db: Session = Depends(get_db)):
    return clinic_hdr_service.get_clinic_doctors(db, payload.clinic_guid)


# Public clinic lookup endpoint
public_router = APIRouter(prefix="/public/clinic", tags=["public"])


@public_router.get("/{slug}", response_model=ClinicHdrResponse)
def get_by_slug(slug: str, db: Session = Depends(get_db)):
    obj = clinic_hdr_service.get_by_slug(db, slug)
    if not obj:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return obj
