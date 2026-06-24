"""Model for app_mda_clinic_hdr table."""

from sqlalchemy import Column, String, Text, DateTime, Index, func, JSON
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaClinicHdr(Base):
    __tablename__ = "app_mda_clinic_hdr"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(255), nullable=True)
    website_url = Column(Text, nullable=True)
    slug = Column(String(100), nullable=True)
    site_metadata = Column(JSON, nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    updated_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_clinic_hdr_name", "name"),
        Index("idx_app_mda_clinic_hdr_status", "status"),
        Index("idx_app_mda_clinic_hdr_created_date", "created_date"),
        Index("idx_app_mda_clinic_hdr_updated_date", "updated_date"),
        Index("idx_app_mda_clinic_hdr_slug", "slug"),
    )
