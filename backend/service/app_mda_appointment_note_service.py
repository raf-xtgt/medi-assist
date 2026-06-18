"""Service for app_mda_appointment_note table."""

from model.app_mda_appointment_note import AppMdaAppointmentNote
from service.base_service import BaseService


class AppMdaAppointmentNoteService(BaseService):
    def __init__(self):
        super().__init__(AppMdaAppointmentNote)


appointment_note_service = AppMdaAppointmentNoteService()
