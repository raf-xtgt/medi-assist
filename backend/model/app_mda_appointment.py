"""Model for app_mda_appointment table."""

from sqlalchemy import Column, String, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaAppointment(Base):
    __tablename__ = "app_mda_appointment"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    clinic_guid = Column(UUID(as_uuid=True), nullable=True)
    doctor_guid = Column(UUID(as_uuid=True), nullable=True)
    patient_guid = Column(UUID(as_uuid=True), nullable=True)
    scheduled_start = Column(DateTime, nullable=True)
    scheduled_end = Column(DateTime, nullable=True)
    appointment_status = Column(String(50), nullable=True)
    running_no = Column(String(255), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_appointment_clinic_guid", "clinic_guid"),
        Index("idx_app_mda_appointment_doctor_guid", "doctor_guid"),
        Index("idx_app_mda_appointment_patient_guid", "patient_guid"),
        Index("idx_app_mda_appointment_scheduled_start", "scheduled_start"),
        Index("idx_app_mda_appointment_scheduled_end", "scheduled_end"),
        Index("idx_app_mda_appointment_status_of_appt", "appointment_status"),
        Index("idx_app_mda_appointment_status", "status"),
        Index("idx_app_mda_appointment_created_date", "created_date"),
        Index("idx_app_mda_appointment_updated_date", "updated_date"),
    )
