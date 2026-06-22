"""Model for app_mda_lead_chat_hdr table."""

from sqlalchemy import Column, Text, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaLeadChatHdr(Base):
    __tablename__ = "app_mda_lead_chat_hdr"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    lead_guid = Column(UUID(as_uuid=True), nullable=True)
    triage_summary = Column(Text, nullable=True)
    created_date = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_chat_hdr_lead_guid", "lead_guid"),
        Index("idx_chat_hdr_created_date", "created_date"),
    )
