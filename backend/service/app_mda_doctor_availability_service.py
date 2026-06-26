"""Service for app_mda_doctor_availability table."""

import uuid
from datetime import date, timedelta, datetime, time

from sqlalchemy.orm import Session

from model.app_mda_doctor_availability import AppMdaDoctorAvailability
from model.app_mda_appointment import AppMdaAppointment
from service.base_service import BaseService


class AppMdaDoctorAvailabilityService(BaseService):
    def __init__(self):
        super().__init__(AppMdaDoctorAvailability)

    def get_by_doctor_guid(self, db: Session, doctor_guid: uuid.UUID) -> list:
        return (
            db.query(AppMdaDoctorAvailability)
            .filter(AppMdaDoctorAvailability.doctor_guid == doctor_guid)
            .all()
        )

    def get_calendar(
        self,
        db: Session,
        doctor_guid: uuid.UUID,
        start_date: date,
        end_date: date,
    ) -> dict:
        """Build a calendar of available appointment slots for a doctor,
        subtracting already-booked appointments."""

        # Step 1: Fetch the doctor's weekly availability template (active only)
        availability_rows = (
            db.query(AppMdaDoctorAvailability)
            .filter(
                AppMdaDoctorAvailability.doctor_guid == doctor_guid,
                AppMdaDoctorAvailability.status == "active",
            )
            .all()
        )

        if not availability_rows:
            return {
                "doctor_guid": doctor_guid,
                "start_date": start_date,
                "end_date": end_date,
                "slot_duration_minutes": 30,
                "available_dates": {},
            }

        # Build lookup: day_of_week -> { start_time, end_time, slot_duration_minutes }
        weekly_template: dict[str, dict] = {}
        first_slot_duration = 30
        for row in availability_rows:
            weekly_template[row.day_of_week] = {
                "start_time": row.start_time,
                "end_time": row.end_time,
                "slot_duration": row.slot_duration_minutes or 30,
            }
            if first_slot_duration == 30 and row.slot_duration_minutes:
                first_slot_duration = row.slot_duration_minutes

        # Step 2: Fetch all SCHEDULED appointments in the date range
        range_start = datetime.combine(start_date, time.min)
        range_end = datetime.combine(end_date + timedelta(days=1), time.min)

        booked_appointments = (
            db.query(AppMdaAppointment)
            .filter(
                AppMdaAppointment.doctor_guid == doctor_guid,
                AppMdaAppointment.appointment_status == "scheduled",
                AppMdaAppointment.scheduled_start >= range_start,
                AppMdaAppointment.scheduled_start < range_end,
            )
            .all()
        )

        # Build set of booked slot keys for O(1) lookup
        booked_set: set[str] = set()
        for appt in booked_appointments:
            if appt.scheduled_start:
                key = appt.scheduled_start.strftime("%Y-%m-%dT%H:%M")
                booked_set.add(key)

        # Step 3: Generate available slots for each date in range
        available_dates: dict[str, list[str]] = {}
        current_date = start_date

        while current_date <= end_date:
            day_name = current_date.strftime("%A")  # "Monday", "Tuesday", etc.

            if day_name in weekly_template:
                template = weekly_template[day_name]
                slot_dur = template["slot_duration"]
                slot_delta = timedelta(minutes=slot_dur)

                slots_for_day: list[str] = []
                current_time = datetime.combine(current_date, template["start_time"])
                end_time_dt = datetime.combine(current_date, template["end_time"])

                while current_time + slot_delta <= end_time_dt:
                    slot_key = current_time.strftime("%Y-%m-%dT%H:%M")
                    if slot_key not in booked_set:
                        slots_for_day.append(current_time.strftime("%H:%M"))
                    current_time += slot_delta

                available_dates[current_date.isoformat()] = slots_for_day

            current_date += timedelta(days=1)

        return {
            "doctor_guid": doctor_guid,
            "start_date": start_date,
            "end_date": end_date,
            "slot_duration_minutes": first_slot_duration,
            "available_dates": available_dates,
        }


doctor_availability_service = AppMdaDoctorAvailabilityService()
