"""Controller for app_mda_appointment endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from model.app_mda_appointment import AppMdaAppointment
from model.dto.patient_appointment_dto import PatientAppointmentListingRequestDto, PatientAppointmentListingDto, PatientAppointmentByPatientRequestDto, PatientAppointmentByPatientDto, PatientLatestAppointmentRequestDto
from service.app_mda_appointment_service import appointment_service
from util.database import get_db

router = APIRouter(prefix="/appointment", tags=["app_mda_appointment"])


@router.get("/get-all", response_model=list[AppointmentResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return appointment_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=AppointmentResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = appointment_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.post("/create", response_model=AppointmentResponse, status_code=201)
def create(payload: AppointmentCreate, db: Session = Depends(get_db)):
    return appointment_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=AppointmentResponse)
def update(guid: UUID, payload: AppointmentUpdate, db: Session = Depends(get_db)):
    obj = appointment_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not appointment_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")


@router.post("/get-appointment-list", response_model=list[PatientAppointmentListingDto])
def get_appointment_list(payload: PatientAppointmentListingRequestDto, db: Session = Depends(get_db)):
    """Get all appointments between a specific doctor and patient."""
    results = (
        db.query(AppMdaAppointment)
        .filter(
            AppMdaAppointment.doctor_guid == payload.doctor_guid,
            AppMdaAppointment.patient_guid == payload.patient_guid,
        )
        .order_by(AppMdaAppointment.scheduled_start.desc())
        .all()
    )

    return [
        PatientAppointmentListingDto(
            doctor_guid=appt.doctor_guid,
            patient_guid=appt.patient_guid,
            appointment_guid=appt.guid,
            appointment_start_time=appt.scheduled_start,
            appointment_end_time=appt.scheduled_end,
            appointment_status=appt.appointment_status,
            appointment_running_no=appt.running_no,
        )
        for appt in results
    ]


@router.post("/latest-appointment", response_model=PatientAppointmentByPatientDto)
def get_latest_appointment(payload: PatientLatestAppointmentRequestDto, db: Session = Depends(get_db)):
    """Get the single most recently updated appointment for a patient with doctor info."""
    result = appointment_service.get_latest_by_patient(db, payload.patient_guid)
    if not result:
        raise HTTPException(status_code=404, detail="No appointments found for this patient")
    return result


@router.post("/get-by-patient", response_model=list[PatientAppointmentByPatientDto])
def get_by_patient(payload: PatientAppointmentByPatientRequestDto, db: Session = Depends(get_db)):
    """Get all appointments for a specific patient with doctor info, ordered by most recent first."""
    return appointment_service.get_by_patient(db, payload.patient_guid)
