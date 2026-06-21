"""Controller for app_mda_clinical_report endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from model.schemas import ClinicalReportCreate, ClinicalReportUpdate, ClinicalReportResponse
from service.app_mda_clinical_report_service import clinical_report_service
from util.database import get_db

router = APIRouter(prefix="/clinical_report", tags=["app_mda_clinical_report"])


@router.get("/get-all", response_model=list[ClinicalReportResponse])
def get_all(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return clinical_report_service.get_all(db, skip=skip, limit=limit)


@router.get("/get-by-guid/{guid}", response_model=ClinicalReportResponse)
def get_by_guid(guid: UUID, db: Session = Depends(get_db)):
    obj = clinical_report_service.get_by_guid(db, guid)
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.get("/get-by-session/{appointment_session_guid}", response_model=list[ClinicalReportResponse])
def get_by_session(appointment_session_guid: UUID, db: Session = Depends(get_db)):
    """Get all clinical reports for a given appointment session."""
    from model.app_mda_clinical_report import AppMdaClinicalReport
    results = db.query(AppMdaClinicalReport).filter(
        AppMdaClinicalReport.appointment_session_guid == appointment_session_guid
    ).all()
    return results


@router.post("/create", response_model=ClinicalReportResponse, status_code=201)
def create(payload: ClinicalReportCreate, db: Session = Depends(get_db)):
    return clinical_report_service.create(db, payload.model_dump())


@router.put("/update/{guid}", response_model=ClinicalReportResponse)
def update(guid: UUID, payload: ClinicalReportUpdate, db: Session = Depends(get_db)):
    obj = clinical_report_service.update(db, guid, payload.model_dump(exclude_unset=True))
    if not obj:
        raise HTTPException(status_code=404, detail="Record not found")
    return obj


@router.delete("/delete/{guid}", status_code=204)
def delete(guid: UUID, db: Session = Depends(get_db)):
    if not clinical_report_service.delete(db, guid):
        raise HTTPException(status_code=404, detail="Record not found")
