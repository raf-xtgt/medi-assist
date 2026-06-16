"""Model for app_mda_prescription table."""

from sqlalchemy import Column, String, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaPrescription(Base):
    __tablename__ = "app_mda_prescription"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    appointment_guid = Column(UUID(as_uuid=True), nullable=True)
    patient_guid = Column(UUID(as_uuid=True), nullable=True)
    medicine_name = Column(String(255), nullable=True)
    dosage = Column(String(255), nullable=True)
    frequency = Column(String(255), nullable=True)
    duration = Column(String(100), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_prescription_appointment_guid", "appointment_guid"),
        Index("idx_app_mda_prescription_patient_guid", "patient_guid"),
        Index("idx_app_mda_prescription_medicine_name", "medicine_name"),
        Index("idx_app_mda_prescription_dosage", "dosage"),
        Index("idx_app_mda_prescription_frequency", "frequency"),
        Index("idx_app_mda_prescription_duration", "duration"),
        Index("idx_app_mda_prescription_status", "status"),
        Index("idx_app_mda_prescription_created_date", "created_date"),
        Index("idx_app_mda_prescription_updated_date", "updated_date"),
    )
