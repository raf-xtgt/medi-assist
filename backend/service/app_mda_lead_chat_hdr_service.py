"""Service for app_mda_lead_chat_hdr table."""

from model.app_mda_lead_chat_hdr import AppMdaLeadChatHdr
from service.base_service import BaseService


class AppMdaLeadChatHdrService(BaseService):
    def __init__(self):
        super().__init__(AppMdaLeadChatHdr)


lead_chat_hdr_service = AppMdaLeadChatHdrService()
