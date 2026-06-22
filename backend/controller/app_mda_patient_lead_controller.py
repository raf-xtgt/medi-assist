"""Controller for app_mda_patient_lead endpoints."""

import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import PatientLeadCreate, PatientLeadUpdate, PatientLeadResponse
from model.dto.lead_conversion_dto import PatientLeadConversionRequestDto, PatientLeadConversionResponseDto
from model.app_mda_patient import AppMdaPatient
from model.app_mda_doctor_patient_link import AppMdaDoctorPatientLink
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


@router.post("/convert-lead-to-patient", response_model=PatientLeadConversionResponseDto, status_code=201)
def convert_lead_to_patient(payload: PatientLeadConversionRequestDto, db: Session = Depends(get_db)):
    """
    Convert a patient lead into a full patient record and link to a doctor.

    1. Retrieves the patient_lead by lead_guid
    2. Creates an app_mda_patient record from lead data
    3. Creates an app_mda_doctor_patient_link record
    4. Updates lead_status to 'converted'
    """
    # 1. Get the lead
    lead = patient_lead_service.get_by_guid(db, payload.lead_guid)
    if not lead:
        raise HTTPException(status_code=404, detail="Patient lead not found")

    # 2. Create patient record from lead data
    patient_guid = uuid.uuid4()
    patient = AppMdaPatient(
        guid=patient_guid,
        lead_guid=lead.guid,
        phone=lead.phone,
        name=lead.name,
        status="active",
    )
    db.add(patient)

    # 3. Create doctor-patient link
    link_guid = uuid.uuid4()
    link = AppMdaDoctorPatientLink(
        guid=link_guid,
        doctor_guid=payload.doctor_guid,
        patient_guid=patient_guid,
        status="active",
    )
    db.add(link)

    # 4. Update lead status
    lead.lead_status = "converted"

    db.commit()
    db.refresh(patient)
    db.refresh(link)

    return PatientLeadConversionResponseDto(
        patient_guid=patient_guid,
        doctor_patient_link_guid=link_guid,
        lead_guid=payload.lead_guid,
        doctor_guid=payload.doctor_guid,
    )
