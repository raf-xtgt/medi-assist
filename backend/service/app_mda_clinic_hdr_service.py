"""Service for app_mda_clinic_hdr table."""

from model.app_mda_clinic_hdr import AppMdaClinicHdr
from service.base_service import BaseService


class AppMdaClinicHdrService(BaseService):
    def __init__(self):
        super().__init__(AppMdaClinicHdr)


clinic_hdr_service = AppMdaClinicHdrService()
