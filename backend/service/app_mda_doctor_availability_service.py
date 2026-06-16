"""Service for app_mda_doctor_availability table."""

from model.app_mda_doctor_availability import AppMdaDoctorAvailability
from service.base_service import BaseService


class AppMdaDoctorAvailabilityService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctorAvailability)


doctor_availability_service = AppMdaDoctorAvailabilityService()
