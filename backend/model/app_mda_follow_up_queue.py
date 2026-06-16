"""Model for app_mda_follow_up_queue table."""

from sqlalchemy import Column, String, Text, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaFollowUpQueue(Base):
    __tablename__ = "app_mda_follow_up_queue"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    appointment_guid = Column(UUID(as_uuid=True), nullable=True)
    patient_guid = Column(UUID(as_uuid=True), nullable=True)
    scheduled_cron = Column(String(100), nullable=True)
    follow_up_msg = Column(Text, nullable=True)
    follow_up_status = Column(String(50), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_follow_up_queue_appointment_guid", "appointment_guid"),
        Index("idx_app_mda_follow_up_queue_patient_guid", "patient_guid"),
        Index("idx_app_mda_follow_up_queue_follow_up_status", "follow_up_status"),
        Index("idx_app_mda_follow_up_queue_status", "status"),
        Index("idx_app_mda_follow_up_queue_created_date", "created_date"),
        Index("idx_app_mda_follow_up_queue_updated_date", "updated_date"),
    )
