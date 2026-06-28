"""DTOs for patient history timeline endpoint."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel
from model.dto.patient_appointment_dto import AppointmentNoteDto


class PrescriptionHistoryDto(BaseModel):
    guid: Optional[UUID] = None
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None

    model_config = {"from_attributes": True}


class ClinicalReportHistoryDto(BaseModel):
    guid: Optional[UUID] = None
    summary: Optional[str] = None
    key_observations: List[str] = []
    red_flags: List[str] = []
    lifestyle_and_diet: List[str] = []
    care_plan_steps: List[str] = []
    form_discrepancies: List[str] = []
    patient_comprehension_rating: Optional[str] = None

    model_config = {"from_attributes": True}


class AppointmentHistoryRecordDto(BaseModel):
    appointment_guid: UUID
    running_no: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    appointment_status: Optional[str] = None
    appointment_note: Optional[AppointmentNoteDto] = None
    prescriptions: List[PrescriptionHistoryDto] = []
    clinical_report: Optional[ClinicalReportHistoryDto] = None

    model_config = {"from_attributes": True}


class PatientHistoryResponseDto(BaseModel):
    doctor_guid: Optional[UUID] = None
    patient_guid: UUID
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    patient_triage_summary: Optional[str] = None
    history_timeline: List[AppointmentHistoryRecordDto] = []

    model_config = {"from_attributes": True}


class DoctorPatientHistoryRequestDto(BaseModel):
    doctor_guid: UUID
    patient_guid: UUID


class PatientOnlyHistoryRequestDto(BaseModel):
    patient_guid: UUID
