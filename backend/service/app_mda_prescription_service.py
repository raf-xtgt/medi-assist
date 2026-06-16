"""Service for app_mda_prescription table."""

from model.app_mda_prescription import AppMdaPrescription
from service.base_service import BaseService


class AppMdaPrescriptionService(BaseService):
    def __init__(self):
        super().__init__(AppMdaPrescription)


prescription_service = AppMdaPrescriptionService()
