"""Service for app_mda_doctor_patient_link table."""

from model.app_mda_doctor_patient_link import AppMdaDoctorPatientLink
from service.base_service import BaseService


class AppMdaDoctorPatientLinkService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctorPatientLink)


doctor_patient_link_service = AppMdaDoctorPatientLinkService()
