"""Model for app_mda_user table."""

from sqlalchemy import Column, String, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaUser(Base):
    __tablename__ = "app_mda_user"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    created_date = Column(DateTime, server_default=func.now())
    status = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_app_mda_user_email", "email"),
        Index("idx_app_mda_user_phone", "phone"),
        Index("idx_app_mda_user_status", "status"),
        Index("idx_app_mda_user_created_date", "created_date"),
    )
