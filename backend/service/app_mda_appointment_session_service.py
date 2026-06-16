"""Service for app_mda_appointment_session table."""

from model.app_mda_appointment_session import AppMdaAppointmentSession
from service.base_service import BaseService


class AppMdaAppointmentSessionService(BaseService):
    def __init__(self):
        super().__init__(AppMdaAppointmentSession)


appointment_session_service = AppMdaAppointmentSessionService()
