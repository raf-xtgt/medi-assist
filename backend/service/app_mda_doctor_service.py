"""Service for app_mda_doctor table."""

from model.app_mda_doctor import AppMdaDoctor
from service.base_service import BaseService


class AppMdaDoctorService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctor)


doctor_service = AppMdaDoctorService()
