"""Model for app_mda_lead_chat_transcript table."""

from sqlalchemy import Column, String, Text, DateTime, Index, func
from sqlalchemy.dialects.postgresql import UUID

from model.base import Base


class AppMdaLeadChatTranscript(Base):
    __tablename__ = "app_mda_lead_chat_transcript"

    guid = Column(UUID(as_uuid=True), primary_key=True)
    chat_hdr_guid = Column(UUID(as_uuid=True), nullable=True)
    msg_content = Column(Text, nullable=True)
    sender = Column(String(50), nullable=True)
    created_date = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_transcript_hdr_guid", "chat_hdr_guid"),
        Index("idx_transcript_sender", "sender"),
        Index("idx_transcript_created_date", "created_date"),
    )
