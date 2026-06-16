"""Model for app_mda_patient table."""

from sqlalchemy import Column, String, Text, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaPatient(Base):
    __tablename__ = "app_mda_patient"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    lead_guid = Column(UUID(as_uuid=True), nullable=True)
    user_guid = Column(UUID(as_uuid=True), nullable=True)
    clinic_hdr_guid = Column(UUID(as_uuid=True), nullable=True)
    phone = Column(String(50), nullable=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_patient_lead_guid", "lead_guid"),
        Index("idx_app_mda_patient_user_guid", "user_guid"),
        Index("idx_app_mda_patient_clinic_hdr_guid", "clinic_hdr_guid"),
        Index("idx_app_mda_patient_phone", "phone"),
        Index("idx_app_mda_patient_name", "name"),
        Index("idx_app_mda_patient_email", "email"),
        Index("idx_app_mda_patient_status", "status"),
        Index("idx_app_mda_patient_created_date", "created_date"),
        Index("idx_app_mda_patient_updated_date", "updated_date"),
    )
