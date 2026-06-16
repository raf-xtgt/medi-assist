"""Service for app_mda_appointment table."""

from model.app_mda_appointment import AppMdaAppointment
from service.base_service import BaseService


class AppMdaAppointmentService(BaseService):
    def __init__(self):
        super().__init__(AppMdaAppointment)


appointment_service = AppMdaAppointmentService()
