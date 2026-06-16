"""Model for app_mda_doctor_cred table."""

from sqlalchemy import Column, String, Text, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import JSON

from model.base import Base


class AppMdaDoctorCred(Base):
    __tablename__ = "app_mda_doctor_cred"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    doctor_guid = Column(UUID(as_uuid=True), nullable=True)
    file_matadata = Column(JSON, nullable=True)
    remarks_1 = Column(Text, nullable=True)
    remarks_2 = Column(Text, nullable=True)
    remarks_3 = Column(Text, nullable=True)
    remarks_4 = Column(Text, nullable=True)
    remarks_5 = Column(Text, nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_doctor_cred_doctor_guid", "doctor_guid"),
        Index("idx_app_mda_doctor_cred_status", "status"),
        Index("idx_app_mda_doctor_cred_created_date", "created_date"),
    )
