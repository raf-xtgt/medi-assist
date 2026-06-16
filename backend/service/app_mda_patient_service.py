"""Service for app_mda_patient table."""

from model.app_mda_patient import AppMdaPatient
from service.base_service import BaseService


class AppMdaPatientService(BaseService):
    def __init__(self):
        super().__init__(AppMdaPatient)


patient_service = AppMdaPatientService()
