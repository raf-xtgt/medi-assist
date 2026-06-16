"""Service for app_mda_follow_up_queue table."""

from model.app_mda_follow_up_queue import AppMdaFollowUpQueue
from service.base_service import BaseService


class AppMdaFollowUpQueueService(BaseService):
    def __init__(self):
        super().__init__(AppMdaFollowUpQueue)


follow_up_queue_service = AppMdaFollowUpQueueService()
