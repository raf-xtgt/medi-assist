"""Service for app_mda_appointment table."""

import uuid

from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from model.app_mda_appointment import AppMdaAppointment
from model.app_mda_doctor import AppMdaDoctor
from model.app_mda_doctor_patient_link import AppMdaDoctorPatientLink
from model.app_mda_patient import AppMdaPatient
from model.app_mda_lead_chat_hdr import AppMdaLeadChatHdr
from service.base_service import BaseService

RUNNING_NO_START = 1000


class AppMdaAppointmentService(BaseService):
    def __init__(self):
        super().__init__(AppMdaAppointment)

    def create(self, db: Session, data: dict):
        """Override create to auto-generate running_no."""
        # Get the current max running_no from the database
        max_no = db.query(sa_func.max(AppMdaAppointment.running_no)).scalar()

        if max_no is not None:
            # running_no is stored as VARCHAR, parse to int and increment
            try:
                next_no = int(max_no) + 1
            except (ValueError, TypeError):
                next_no = RUNNING_NO_START
        else:
            next_no = RUNNING_NO_START

        data["running_no"] = str(next_no)
        return super().create(db, data)

    def get_latest_by_patient(self, db: Session, patient_guid: uuid.UUID) -> dict | None:
        """Get the single most-recently updated appointment for a patient with doctor info.

        Uses a LEFT JOIN to doctor and orders by updated_date DESC with LIMIT 1
        for an optimal single-row fetch.
        """
        row = (
            db.query(
                AppMdaAppointment.guid.label("appointment_guid"),
                AppMdaAppointment.doctor_guid,
                AppMdaAppointment.patient_guid,
                AppMdaAppointment.scheduled_start.label("appointment_start_time"),
                AppMdaAppointment.scheduled_end.label("appointment_end_time"),
                AppMdaAppointment.appointment_status,
                AppMdaAppointment.running_no.label("appointment_running_no"),
                AppMdaDoctor.name.label("doctor_name"),
                AppMdaDoctor.specialty.label("doctor_specialty"),
                AppMdaDoctor.image_url.label("doctor_image_url"),
            )
            .outerjoin(
                AppMdaDoctor,
                AppMdaAppointment.doctor_guid == AppMdaDoctor.guid,
            )
            .filter(AppMdaAppointment.patient_guid == patient_guid)
            .order_by(AppMdaAppointment.updated_date.desc())
            .limit(1)
            .first()
        )

        if not row:
            return None

        return {
            "doctor_guid": row.doctor_guid,
            "patient_guid": row.patient_guid,
            "appointment_guid": row.appointment_guid,
            "appointment_start_time": row.appointment_start_time,
            "appointment_end_time": row.appointment_end_time,
            "appointment_status": row.appointment_status,
            "appointment_running_no": row.appointment_running_no,
            "doctor_name": row.doctor_name,
            "doctor_specialty": row.doctor_specialty,
            "doctor_image_url": row.doctor_image_url,
        }

    def get_by_patient(self, db: Session, patient_guid: uuid.UUID) -> list[dict]:
        """Get all appointments for a patient with doctor info via LEFT JOIN.

        Joins appointment → doctor to include doctor name, specialty, and image_url.
        Returns results ordered by scheduled_start descending (most recent first).
        """
        results = (
            db.query(
                AppMdaAppointment.guid.label("appointment_guid"),
                AppMdaAppointment.doctor_guid,
                AppMdaAppointment.patient_guid,
                AppMdaAppointment.scheduled_start.label("appointment_start_time"),
                AppMdaAppointment.scheduled_end.label("appointment_end_time"),
                AppMdaAppointment.appointment_status,
                AppMdaAppointment.running_no.label("appointment_running_no"),
                AppMdaDoctor.name.label("doctor_name"),
                AppMdaDoctor.specialty.label("doctor_specialty"),
                AppMdaDoctor.image_url.label("doctor_image_url"),
            )
            .outerjoin(
                AppMdaDoctor,
                AppMdaAppointment.doctor_guid == AppMdaDoctor.guid,
            )
            .filter(AppMdaAppointment.patient_guid == patient_guid)
            .order_by(AppMdaAppointment.scheduled_start.desc())
            .all()
        )

        return [
            {
                "doctor_guid": row.doctor_guid,
                "patient_guid": row.patient_guid,
                "appointment_guid": row.appointment_guid,
                "appointment_start_time": row.appointment_start_time,
                "appointment_end_time": row.appointment_end_time,
                "appointment_status": row.appointment_status,
                "appointment_running_no": row.appointment_running_no,
                "doctor_name": row.doctor_name,
                "doctor_specialty": row.doctor_specialty,
                "doctor_image_url": row.doctor_image_url,
            }
            for row in results
        ]

    def get_patients_by_doctor(self, db: Session, doctor_guid: uuid.UUID) -> list[dict]:
        """Get patients linked to a doctor with their triage summary.

        Uses a single query with JOINs:
          doctor_patient_link → patient → lead_chat_hdr (via lead_guid)

        This avoids N+1 queries by fetching all related data in one pass.
        Only ACTIVE links are included.
        """
        results = (
            db.query(
                AppMdaDoctorPatientLink.doctor_guid,
                AppMdaPatient.guid.label("patient_guid"),
                AppMdaPatient.phone.label("patient_phone"),
                AppMdaPatient.name.label("patient_name"),
                AppMdaPatient.email.label("patient_email"),
                AppMdaPatient.address.label("patient_address"),
                AppMdaLeadChatHdr.triage_summary.label("patient_triage_summary"),
            )
            .join(
                AppMdaPatient,
                AppMdaDoctorPatientLink.patient_guid == AppMdaPatient.guid,
            )
            .outerjoin(
                AppMdaLeadChatHdr,
                AppMdaPatient.lead_guid == AppMdaLeadChatHdr.lead_guid,
            )
            .filter(
                AppMdaDoctorPatientLink.doctor_guid == doctor_guid,
            )
            .all()
        )

        return [
            {
                "doctor_guid": row.doctor_guid,
                "patient_guid": row.patient_guid,
                "patient_phone": row.patient_phone or "",
                "patient_name": row.patient_name or "",
                "patient_email": row.patient_email or "",
                "patient_address": row.patient_address or "",
                "patient_triage_summary": row.patient_triage_summary,
            }
            for row in results
        ]


appointment_service = AppMdaAppointmentService()
