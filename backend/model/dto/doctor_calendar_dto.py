class DoctorCalendarRequest(BaseModel):
    doctor_guid: UUID
    start_date: date
    end_date: date

class DoctorCalendarResponse(BaseModel):
    doctor_guid: UUID
    start_date: date
    end_date: date
    slot_duration_minutes: int
    available_dates: dict[str, list[str]]   # ISO date → list of "HH:MM" times
    