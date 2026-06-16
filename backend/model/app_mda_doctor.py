"""Model for app_mda_doctor table."""

from sqlalchemy import Column, String, Text, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaDoctor(Base):
    __tablename__ = "app_mda_doctor"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    user_guid = Column(UUID(as_uuid=True), nullable=True)
    clinic_hdr_guid = Column(UUID(as_uuid=True), nullable=True)
    phone = Column(String(50), nullable=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    about = Column(Text, nullable=True)
    specialty = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_doctor_user_guid", "user_guid"),
        Index("idx_app_mda_doctor_clinic_hdr_guid", "clinic_hdr_guid"),
        Index("idx_app_mda_doctor_phone", "phone"),
        Index("idx_app_mda_doctor_name", "name"),
        Index("idx_app_mda_doctor_email", "email"),
        Index("idx_app_mda_doctor_specialty", "specialty"),
        Index("idx_app_mda_doctor_status", "status"),
        Index("idx_app_mda_doctor_created_date", "created_date"),
    )
