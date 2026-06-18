"""Model for app_mda_appointment_note table."""

from sqlalchemy import Column, String, Text, Integer, Numeric, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaAppointmentNote(Base):
    __tablename__ = "app_mda_appointment_note"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    appointment_guid = Column(UUID(as_uuid=True), nullable=True)
    patient_guid = Column(UUID(as_uuid=True), nullable=True)
    main_complaint = Column(Text, nullable=True)
    blood_pressure = Column(String(11), nullable=True)
    heart_rate = Column(Integer, nullable=True)
    temperature = Column(Numeric(4, 1), nullable=True)
    respiratory_rate = Column(Integer, nullable=True)
    oxygen_saturation = Column(Numeric(4, 1), nullable=True)
    weight = Column(Numeric(5, 2), nullable=True)
    additional_remarks = Column(Text, nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_appointment_note_apmt", "appointment_guid"),
        Index("idx_app_mda_appointment_note_patient_guid", "patient_guid"),
        Index("idx_app_mda_appointment_note_status", "status"),
        Index("idx_app_mda_appointment_note_created_date", "created_date"),
        Index("idx_app_mda_appointment_note_updated_date", "updated_date"),
    )
