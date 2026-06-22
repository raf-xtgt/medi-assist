"""Service for app_mda_lead_chat_transcript table."""

from model.app_mda_lead_chat_transcript import AppMdaLeadChatTranscript
from service.base_service import BaseService


class AppMdaLeadChatTranscriptService(BaseService):
    def __init__(self):
        super().__init__(AppMdaLeadChatTranscript)


lead_chat_transcript_service = AppMdaLeadChatTranscriptService()
