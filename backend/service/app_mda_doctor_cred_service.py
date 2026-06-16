"""Service for app_mda_doctor_cred table."""

from model.app_mda_doctor_cred import AppMdaDoctorCred
from service.base_service import BaseService


class AppMdaDoctorCredService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctorCred)


doctor_cred_service = AppMdaDoctorCredService()
