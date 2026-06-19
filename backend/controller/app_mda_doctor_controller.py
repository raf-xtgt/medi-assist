"""Controller for app_mda_doctor endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from model.schemas import DoctorCreate, DoctorUpdate, DoctorResponse
from model.dto.doctor_patient_dto import DoctorPatientRequestDto, DoctorPatientListDto
from model.dto.patient_appointment_dto import PatientAppointmentRequestDto, PatientAppointmentDto, PatientReportDto
from model.app_mda_doctor_patient_link import AppMdaDoctorPatientLink
from model.app_mda_patient import AppMdaPatient
from model.app_mda_appointment import AppMdaAppointment
from model.app_mda_appointment_session import AppMdaAppointmentSession
from model.app_mda_appointment_note import AppMdaAppointmentNote
from model.app_mda_prescription import AppMdaPrescription
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


@router.post("/patient-report", response_model=PatientReportDto)
def get_patient_report(payload: PatientAppointmentRequestDto, db: Session = Depends(get_db)):
    """
    Generate a full patient report with all appointment details.

    Joins appointment → appointment_session, appointment_note, and prescription
    to build a comprehensive view of each appointment for the given patient.
    Optimized with LEFT JOINs so appointments without sessions/notes/prescriptions
    are still included.
    """
    patient_guid = payload.patient_guid

    # Get all appointments for this patient, ordered by most recent first
    appointments = (
        db.query(AppMdaAppointment)
        .filter(AppMdaAppointment.patient_guid == patient_guid)
        .order_by(AppMdaAppointment.scheduled_start.desc())
        .all()
    )

    if not appointments:
        return PatientReportDto(
            patient_guid=patient_guid,
            total_appointment_sessions=0,
            appointment_detail_list=[],
        )

    # Extract doctor_guid and clinic_guid from the first appointment
    first_appt = appointments[0]
    doctor_guid = first_appt.doctor_guid
    clinic_hdr_guid = first_appt.clinic_guid

    appointment_guids = [appt.guid for appt in appointments]

    # Batch fetch all related data for these appointments
    sessions = (
        db.query(AppMdaAppointmentSession)
        .filter(AppMdaAppointmentSession.appointment_guid.in_(appointment_guids))
        .all()
    )
    sessions_map = {s.appointment_guid: s for s in sessions}

    notes = (
        db.query(AppMdaAppointmentNote)
        .filter(AppMdaAppointmentNote.appointment_guid.in_(appointment_guids))
        .all()
    )
    notes_map = {n.appointment_guid: n for n in notes}

    prescriptions = (
        db.query(AppMdaPrescription)
        .filter(AppMdaPrescription.appointment_guid.in_(appointment_guids))
        .all()
    )
    # Group prescriptions by appointment — take the first one for the DTO
    prescriptions_map: dict = {}
    for p in prescriptions:
        if p.appointment_guid not in prescriptions_map:
            prescriptions_map[p.appointment_guid] = p

    # Build the detail list
    detail_list = []
    for appt in appointments:
        session = sessions_map.get(appt.guid)
        note = notes_map.get(appt.guid)
        prescription = prescriptions_map.get(appt.guid)

        detail_list.append(
            PatientAppointmentDto(
                appointment_guid=appt.guid,
                appointment_start_time=appt.scheduled_start,
                appointment_end_time=appt.scheduled_end,
                appointment_session_transcript=session.transcript if session else None,
                appointment_session_transcript_status=session.transcription_status if session else None,
                appointment_session_transcript_metadata=session.transcript_metadata if session else None,
                appointment_note=note.main_complaint if note else None,
                appointment_prescription_medicine_name=prescription.medicine_name if prescription else None,
                appointment_prescription_dosage=prescription.dosage if prescription else None,
                appointment_prescription_frequency=prescription.frequency if prescription else None,
                appointment_prescription_duration=prescription.duration if prescription else None,
            )
        )

    return PatientReportDto(
        doctor_guid=doctor_guid,
        clinic_hdr_guid=clinic_hdr_guid,
        patient_guid=patient_guid,
        total_appointment_sessions=len(sessions),
        appointment_detail_list=detail_list,
    )
