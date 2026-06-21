"""Model for app_mda_clinical_report table."""

from sqlalchemy import Column, String, Text, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from model.base import Base


class AppMdaClinicalReport(Base):
    __tablename__ = "app_mda_clinical_report"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    appointment_session_guid = Column(UUID(as_uuid=True), nullable=True)

    # Clinical Insights Block
    summary = Column(Text, nullable=True)
    key_observations = Column(ARRAY(Text), server_default="{}")
    red_flags = Column(ARRAY(Text), server_default="{}")

    # Patient Instructions Block
    lifestyle_and_diet = Column(ARRAY(Text), server_default="{}")
    care_plan_steps = Column(ARRAY(Text), server_default="{}")

    # Clinical Audit Block
    form_discrepancies = Column(ARRAY(Text), server_default="{}")
    patient_comprehension_rating = Column(String(50), nullable=True)

    # System Metadata Block
    generated_by = Column(String(50), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_clinical_report_appt_session", "appointment_session_guid"),
        Index("idx_clinical_report_created_date", "created_date"),
        Index("idx_clinical_report_updated_date", "updated_date"),
    )
