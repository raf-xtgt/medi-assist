"""Model for app_mda_appointment_session table."""

from sqlalchemy import Column, String, Text, Boolean, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON

from model.base import Base


class AppMdaAppointmentSession(Base):
    __tablename__ = "app_mda_appointment_session"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    appointment_guid = Column(UUID(as_uuid=True), nullable=True)
    doctor_guid = Column(UUID(as_uuid=True), nullable=True)
    audio_stream_url = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    transcription_status = Column(String(50), nullable=True)
    transcript_metadata = Column(JSON, nullable=True)
    is_reviewed_by_doctor = Column(Boolean, nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_appointment_session_appointment_guid", "appointment_guid"),
        Index("idx_app_mda_appointment_session_doctor_guid", "doctor_guid"),
        Index("idx_app_mda_appointment_session_reviewed_by_doctor", "is_reviewed_by_doctor"),
        Index("idx_app_mda_appointment_session_status", "status"),
        Index("idx_app_mda_appointment_session_created_date", "created_date"),
        Index("idx_app_mda_appointment_session_updated_date", "updated_date"),
    )
