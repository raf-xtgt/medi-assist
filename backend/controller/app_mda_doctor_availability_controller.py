"""Controller for app_mda_doctor_availability endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import DoctorAvailabilityCreate, DoctorAvailabilityUpdate, DoctorAvailabilityResponse, DoctorCalendarRequest, DoctorCalendarResponse
from service.app_mda_doctor_availability_service import doctor_availability_service
from util.database import get_db

router = APIRouter(prefix="/doctor-availability", tags=["app_mda_doctor_availability"])


@router.get("/get-all", response_model=list[DoctorAvailabilityResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return doctor_availability_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=DoctorAvailabilityResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = doctor_availability_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.get("/get-by-doctor/{doctor_guid}", response_model=list[DoctorAvailabilityResponse])
def get_by_doctor(doctor_guid: UUID, db: Session = Depends(get_db)):
    return doctor_availability_service.get_by_doctor_guid(db, doctor_guid)


@router.post("/create", response_model=DoctorAvailabilityResponse, status_code=201)
def create(payload: DoctorAvailabilityCreate, db: Session = Depends(get_db)):
    return doctor_availability_service.create(db, payload.model_dump())


@router.post("/multi-create", response_model=list[DoctorAvailabilityResponse], status_code=201)
def multi_create(payloads: list[DoctorAvailabilityCreate], db: Session = Depends(get_db)):
    results = []
    for payload in payloads:
        obj = doctor_availability_service.create(db, payload.model_dump())
        results.append(obj)
    return results


@router.put("/update/{guid}", response_model=DoctorAvailabilityResponse)
def update(guid: UUID, payload: DoctorAvailabilityUpdate, db: Session = Depends(get_db)):
    obj = doctor_availability_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.put("/multi-update", response_model=list[DoctorAvailabilityResponse])
def multi_update(payloads: list[DoctorAvailabilityUpdate], db: Session = Depends(get_db)):
    results = []
    for payload in payloads:
        data = payload.model_dump(exclude_unset=True)
        guid = data.pop("guid", None)
        if not guid:
            raise HTTPException(status_code=400, detail="Each item must include a 'guid' field")
        obj = doctor_availability_service.update(db, guid, data)
        if not obj:
            raise HTTPException(status_code=404, detail=f"Record not found for guid: {guid}")
        results.append(obj)
    return results


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not doctor_availability_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")


@router.post("/calendar", response_model=DoctorCalendarResponse)
def get_calendar(payload: DoctorCalendarRequest, db: Session = Depends(get_db)):
    return doctor_availability_service.get_calendar(
        db, payload.doctor_guid, payload.start_date, payload.end_date
    )
