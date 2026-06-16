"""Model for app_mda_doctor_patient_link table."""

from sqlalchemy import Column, String, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaDoctorPatientLink(Base):
    __tablename__ = "app_mda_doctor_patient_link"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    doctor_guid = Column(UUID(as_uuid=True), nullable=True)
    patient_guid = Column(UUID(as_uuid=True), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_doctor_patient_link_doctor_guid", "doctor_guid"),
        Index("idx_app_mda_doctor_patient_link_patient_guid", "patient_guid"),
        Index("idx_app_mda_doctor_patient_link_status", "status"),
        Index("idx_app_mda_doctor_patient_link_created_date", "created_date"),
        Index("idx_app_mda_doctor_patient_link_updated_date", "updated_date"),
    )
