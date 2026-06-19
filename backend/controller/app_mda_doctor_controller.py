"""Controller for app_mda_doctor endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from model.schemas import DoctorCreate, DoctorUpdate, DoctorResponse
from model.dto.doctor_patient_dto import DoctorPatientRequestDto, DoctorPatientListDto
from model.app_mda_doctor_patient_link import AppMdaDoctorPatientLink
from model.app_mda_patient import AppMdaPatient
from model.app_mda_appointment import AppMdaAppointment
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


@router.post("/patient-list", response_model=list[DoctorPatientListDto])
def get_patient_list(payload: DoctorPatientRequestDto, db: Session = Depends(get_db)):
    """
    Get the list of patients linked to a doctor within a clinic,
    along with the total number of completed appointments per patient.

    Uses a subquery for completed appointment counts joined to the
    doctor_patient_link → patient chain for optimal performance on large datasets.
    """
    doctor_guid = payload.doctor_guid
    clinic_hdr_guid = payload.clinic_hdr_guid

    # Subquery: count completed appointments per patient for this doctor
    completed_subq = (
        db.query(
            AppMdaAppointment.patient_guid,
            sa_func.count(AppMdaAppointment.guid).label("total_completed"),
        )
        .filter(
            AppMdaAppointment.doctor_guid == doctor_guid,
            AppMdaAppointment.clinic_guid == clinic_hdr_guid,
            AppMdaAppointment.appointment_status == "completed",
        )
        .group_by(AppMdaAppointment.patient_guid)
        .subquery()
    )

    # Main query: link → patient LEFT JOIN completed counts
    results = (
        db.query(
            AppMdaDoctorPatientLink.doctor_guid,
            AppMdaPatient.clinic_hdr_guid,
            AppMdaPatient.guid.label("patient_guid"),
            AppMdaPatient.phone.label("patient_phone"),
            AppMdaPatient.name.label("patient_name"),
            AppMdaPatient.email.label("patient_email"),
            AppMdaPatient.address.label("patient_address"),
            sa_func.coalesce(completed_subq.c.total_completed, 0).label("total_completed_appointments"),
        )
        .join(
            AppMdaPatient,
            AppMdaDoctorPatientLink.patient_guid == AppMdaPatient.guid,
        )
        .outerjoin(
            completed_subq,
            AppMdaPatient.guid == completed_subq.c.patient_guid,
        )
        .filter(
            AppMdaDoctorPatientLink.doctor_guid == doctor_guid,
            AppMdaPatient.clinic_hdr_guid == clinic_hdr_guid,
            sa_func.upper(AppMdaDoctorPatientLink.status) == "ACTIVE",
        )
        .all()
    )

    return [
        DoctorPatientListDto(
            doctor_guid=row.doctor_guid,
            clinic_hdr_guid=row.clinic_hdr_guid,
            patient_guid=row.patient_guid,
            patient_phone=row.patient_phone or "",
            patient_name=row.patient_name or "",
            patient_email=row.patient_email or "",
            patient_address=row.patient_address or "",
            total_completed_appointments=row.total_completed_appointments,
        )
        for row in results
    ]
