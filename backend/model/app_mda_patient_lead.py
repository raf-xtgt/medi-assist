"""Model for app_mda_patient_lead table."""

from sqlalchemy import Column, String, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaPatientLead(Base):
    __tablename__ = "app_mda_patient_lead"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    phone = Column(String(50), nullable=True)
    name = Column(String(255), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    lead_status = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_patient_lead_name", "name"),
        Index("idx_app_mda_patient_lead_phone", "phone"),
        Index("idx_app_mda_patient_lead_status_of_lead", "lead_status"),
        Index("idx_app_mda_patient_lead_status", "status"),
        Index("idx_app_mda_patient_lead_created_date", "created_date"),
    )
