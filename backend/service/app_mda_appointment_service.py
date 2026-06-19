"""Service for app_mda_appointment table."""

from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from model.app_mda_appointment import AppMdaAppointment
from service.base_service import BaseService

RUNNING_NO_START = 1000


class AppMdaAppointmentService(BaseService):
    def __init__(self):
        super().__init__(AppMdaAppointment)

    def create(self, db: Session, data: dict):
        """Override create to auto-generate running_no."""
        # Get the current max running_no from the database
        max_no = db.query(sa_func.max(AppMdaAppointment.running_no)).scalar()

        if max_no is not None:
            # running_no is stored as VARCHAR, parse to int and increment
            try:
                next_no = int(max_no) + 1
            except (ValueError, TypeError):
                next_no = RUNNING_NO_START
        else:
            next_no = RUNNING_NO_START

        data["running_no"] = str(next_no)
        return super().create(db, data)


appointment_service = AppMdaAppointmentService()
