"""Model for app_mda_doctor_availability table."""

from sqlalchemy import Column, String, Integer, Time, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaDoctorAvailability(Base):
    __tablename__ = "app_mda_doctor_availability"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    doctor_guid = Column(UUID(as_uuid=True), nullable=True)
    day_of_week = Column(String(50), nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    slot_duration_minutes = Column(Integer, nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_doctor_availability_doctor_guid", "doctor_guid"),
        Index("idx_app_mda_doctor_availability_day_of_week", "day_of_week"),
        Index("idx_app_mda_doctor_availability_slot_duration_minutes", "slot_duration_minutes"),
        Index("idx_app_mda_doctor_availability_start_time", "start_time"),
        Index("idx_app_mda_doctor_availability_end_time", "end_time"),
        Index("idx_app_mda_doctor_availability_status", "status"),
        Index("idx_app_mda_doctor_availability_created_date", "created_date"),
        Index("idx_app_mda_doctor_availability_updated_date", "updated_date"),
    )
