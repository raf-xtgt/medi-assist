"""Service for app_mda_patient_lead table."""

from model.app_mda_patient_lead import AppMdaPatientLead
from service.base_service import BaseService


class AppMdaPatientLeadService(BaseService):
    def __init__(self):
        super().__init__(AppMdaPatientLead)


patient_lead_service = AppMdaPatientLeadService()
