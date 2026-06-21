"""Service for app_mda_clinical_report table."""

from model.app_mda_clinical_report import AppMdaClinicalReport
from service.base_service import BaseService


class AppMdaClinicalReportService(BaseService):
    def __init__(self):
        super().__init__(AppMdaClinicalReport)


clinical_report_service = AppMdaClinicalReportService()
