"""Model for app_mda_prmn (permissions) table."""

from sqlalchemy import Column, String, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaPrmn(Base):
    __tablename__ = "app_mda_prmn"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    user_guid = Column(UUID(as_uuid=True), nullable=True)
    role = Column(String(50), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_prmn_user_guid", "user_guid"),
        Index("idx_app_mda_prmn_role", "role"),
        Index("idx_app_mda_prmn_status", "status"),
        Index("idx_app_mda_prmn_created_date", "created_date"),
    )
