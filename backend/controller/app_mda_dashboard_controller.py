"""Controller for dashboard endpoints."""

from datetime import date, datetime, time
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, case, extract
from sqlalchemy.orm import Session

from model.schemas import AdminDashboardResponse, DoctorDashboardResponse
from model.app_mda_appointment import AppMdaAppointment
from model.app_mda_doctor import AppMdaDoctor
from model.app_mda_patient import AppMdaPatient
from model.app_mda_appointment_note import AppMdaAppointmentNote
from model.app_mda_doctor_availability import AppMdaDoctorAvailability
from model.app_mda_appointment_session import AppMdaAppointmentSession
from model.app_mda_clinical_report import AppMdaClinicalReport
from model.app_mda_prescription import AppMdaPrescription
from model.app_mda_lead_chat_hdr import AppMdaLeadChatHdr
from util.database import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(clinic_guid: UUID, query_date: Optional[date] = None, db: Session = Depends(get_db)):
    """Retrieve operational health metrics, doctor loads, and appointments list for the admin dashboard today."""
    target_date = query_date or date.today()
    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = datetime.combine(target_date, datetime.max.time())

    # --- Query 1: Fetch all appointments for the clinic today (Optimal Single Join) ---
    appointments_data = (
        db.query(
            AppMdaAppointment.guid.label("appointment_guid"),
            AppMdaAppointment.scheduled_start,
            AppMdaAppointment.scheduled_end,
            AppMdaAppointment.appointment_status,
            AppMdaPatient.name.label("patient_name"),
            AppMdaDoctor.guid.label("doctor_guid"),
            AppMdaDoctor.name.label("doctor_name"),
            AppMdaDoctor.specialty.label("doctor_specialty"),
            AppMdaAppointmentNote.main_complaint.label("visit_type")
        )
        .join(AppMdaPatient, AppMdaAppointment.patient_guid == AppMdaPatient.guid)
        .join(AppMdaDoctor, AppMdaAppointment.doctor_guid == AppMdaDoctor.guid)
        .outerjoin(AppMdaAppointmentNote, AppMdaAppointment.guid == AppMdaAppointmentNote.appointment_guid)
        .filter(
            AppMdaAppointment.clinic_guid == clinic_guid,
            AppMdaAppointment.scheduled_start >= start_dt,
            AppMdaAppointment.scheduled_start <= end_dt,
            AppMdaAppointment.status == "active"
        )
        .order_by(AppMdaAppointment.scheduled_start.asc())
        .all()
    )

    # Calculate KPIs in memory to prevent multiple round-trips
    total = len(appointments_data)
    completed = sum(1 for a in appointments_data if a.appointment_status == "done")
    remaining = sum(1 for a in appointments_data if a.appointment_status in ("scheduled", "in-progress"))
    canceled_postponed = sum(1 for a in appointments_data if a.appointment_status in ("canceled", "postponed"))
    completion_rate = (completed / total * 100) if total > 0 else 0.0

    # --- Query 2: Fetch Doctor Availability for Utilization Calculations ---
    doctor_guids = list({a.doctor_guid for a in appointments_data})
    day_of_week = target_date.strftime("%A")
    
    availabilities = {}
    if doctor_guids:
        avail_list = (
            db.query(AppMdaDoctorAvailability)
            .filter(
                AppMdaDoctorAvailability.doctor_guid.in_(doctor_guids),
                AppMdaDoctorAvailability.day_of_week == day_of_week,
                AppMdaDoctorAvailability.status == "active"
            )
            .all()
        )
        for av in avail_list:
            if av.start_time and av.end_time:
                duration = (datetime.combine(date.today(), av.end_time) - datetime.combine(date.today(), av.start_time)).seconds / 60
                availabilities[av.doctor_guid] = duration

    # Compute provider load items
    provider_loads = []
    # Fetch all active doctors in this clinic to show even if they have 0 appointments
    all_docs = db.query(AppMdaDoctor).filter(AppMdaDoctor.clinic_hdr_guid == clinic_guid, AppMdaDoctor.status == "active").all()
    
    for doc in all_docs:
        doc_appts = [a for a in appointments_data if a.doctor_guid == doc.guid]
        doc_total = len(doc_appts)
        doc_completed = sum(1 for a in doc_appts if a.appointment_status == "done")
        
        # calculate booked duration
        booked_minutes = sum(
            ((a.scheduled_end - a.scheduled_start).seconds / 60)
            for a in doc_appts
            if a.appointment_status not in ("canceled", "postponed") and a.scheduled_start and a.scheduled_end
        )
        
        # default to 8-hour shift (480 mins) if no availability set
        avail_minutes = availabilities.get(doc.guid, 480.0)
        utilization = min((booked_minutes / avail_minutes * 100), 100.0) if avail_minutes > 0 else 0.0

        provider_loads.append({
            "doctor_guid": doc.guid,
            "doctor_name": doc.name,
            "specialty": doc.specialty or "General Practice",
            "completed_appointments": doc_completed,
            "total_appointments": doc_total,
            "utilization_percentage": round(utilization, 1)
        })

    avg_utilization = sum(p["utilization_percentage"] for p in provider_loads) / len(provider_loads) if provider_loads else 0.0

    return {
        "clinic_guid": clinic_guid,
        "date": target_date,
        "kpis": {
            "total_appointments": total,
            "remaining_appointments": remaining,
            "completed_appointments": completed,
            "completion_rate": round(completion_rate, 1),
            "canceled_or_postponed_appointments": canceled_postponed,
            "average_utilization_rate": round(avg_utilization, 1)
        },
        "provider_loads": provider_loads,
        "appointments": [
            {
                "appointment_guid": a.appointment_guid,
                "time": a.scheduled_start.strftime("%H:%M") if a.scheduled_start else "",
                "patient_name": a.patient_name,
                "doctor_name": a.doctor_name,
                "visit_type": a.visit_type or "GP Consult",
                "appointment_status": a.appointment_status
            }
            for a in appointments_data
        ]
    }


@router.get("/doctor", response_model=DoctorDashboardResponse)
def get_doctor_dashboard(doctor_guid: UUID, query_date: Optional[date] = None, db: Session = Depends(get_db)):
    """Retrieve clinical overview, patient queue, and recent activities feed for a doctor today."""
    target_date = query_date or date.today()
    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = datetime.combine(target_date, datetime.max.time())

    # --- Query 1: Doctor's Appointments for the Day ---
    appointments = (
        db.query(
            AppMdaAppointment.guid.label("appointment_guid"),
            AppMdaAppointment.scheduled_start,
            AppMdaAppointment.scheduled_end,
            AppMdaAppointment.appointment_status,
            AppMdaPatient.guid.label("patient_guid"),
            AppMdaPatient.name.label("patient_name"),
            AppMdaAppointmentNote.main_complaint.label("note_complaint"),
            AppMdaLeadChatHdr.triage_summary.label("triage_summary")
        )
        .join(AppMdaPatient, AppMdaAppointment.patient_guid == AppMdaPatient.guid)
        .outerjoin(AppMdaAppointmentNote, AppMdaAppointment.guid == AppMdaAppointmentNote.appointment_guid)
        .outerjoin(AppMdaLeadChatHdr, AppMdaPatient.lead_guid == AppMdaLeadChatHdr.lead_guid)
        .filter(
            AppMdaAppointment.doctor_guid == doctor_guid,
            AppMdaAppointment.scheduled_start >= start_dt,
            AppMdaAppointment.scheduled_start <= end_dt,
            AppMdaAppointment.status == "active"
        )
        .order_by(AppMdaAppointment.scheduled_start.asc())
        .all()
    )

    total_appts = len(appointments)
    patients_today = len({a.patient_guid for a in appointments})
    patients_remaining = len({a.patient_guid for a in appointments if a.appointment_status in ("scheduled", "in-progress", "waiting")})
    
    # Next upcoming appointment
    now = datetime.now()
    next_appt = next((a for a in appointments if a.scheduled_start > now and a.appointment_status in ("scheduled", "waiting")), None)
    next_time_str = next_appt.scheduled_start.strftime("%H:%M") if next_appt else None

    # --- Query 2: Pending Chart Notes ---
    pending_notes = (
        db.query(func.count(AppMdaAppointmentSession.guid))
        .filter(
            AppMdaAppointmentSession.doctor_guid == doctor_guid,
            AppMdaAppointmentSession.is_reviewed_by_doctor == False,
            AppMdaAppointmentSession.status == "active"
        )
        .scalar() or 0
    )

    # --- Query 3: Average Consultation Duration ---
    avg_duration = (
        db.query(
            func.avg(
                extract('epoch', AppMdaAppointmentSession.updated_date - AppMdaAppointmentSession.created_date) / 60
            )
        )
        .filter(
            AppMdaAppointmentSession.doctor_guid == doctor_guid,
            AppMdaAppointmentSession.is_reviewed_by_doctor == True,
            AppMdaAppointmentSession.status == "active"
        )
        .scalar() or 12.0  # default target duration
    )

    # --- Query 4: Recent Activities Feed ---
    # 4a. Latest generated reports
    recent_reports = (
        db.query(AppMdaClinicalReport.created_date, AppMdaPatient.name)
        .join(AppMdaAppointmentSession, AppMdaClinicalReport.appointment_session_guid == AppMdaAppointmentSession.guid)
        .join(AppMdaAppointment, AppMdaAppointmentSession.appointment_guid == AppMdaAppointment.guid)
        .join(AppMdaPatient, AppMdaAppointment.patient_guid == AppMdaPatient.guid)
        .filter(AppMdaAppointmentSession.doctor_guid == doctor_guid)
        .order_by(AppMdaClinicalReport.created_date.desc())
        .limit(5)
        .all()
    )
    # 4b. Latest completed chart notes
    recent_notes = (
        db.query(AppMdaAppointmentNote.created_date, AppMdaPatient.name)
        .join(AppMdaAppointment, AppMdaAppointmentNote.appointment_guid == AppMdaAppointment.guid)
        .join(AppMdaPatient, AppMdaAppointment.patient_guid == AppMdaPatient.guid)
        .filter(AppMdaAppointment.doctor_guid == doctor_guid)
        .order_by(AppMdaAppointmentNote.created_date.desc())
        .limit(5)
        .all()
    )
    # 4c. Latest written prescriptions
    recent_prescriptions = (
        db.query(AppMdaPrescription.created_date, AppMdaPatient.name, AppMdaPrescription.medicine_name)
        .join(AppMdaAppointment, AppMdaPrescription.appointment_guid == AppMdaAppointment.guid)
        .join(AppMdaPatient, AppMdaPrescription.patient_guid == AppMdaPatient.guid)
        .filter(AppMdaAppointment.doctor_guid == doctor_guid)
        .order_by(AppMdaPrescription.created_date.desc())
        .limit(5)
        .all()
    )

    activities = []
    for r in recent_reports:
        activities.append({
            "id": f"rep-{r.created_date.timestamp()}",
            "activity_type": "clinical_report",
            "message": f"AI Clinical Report generated for {r.name}",
            "timestamp": r.created_date
        })
    for n in recent_notes:
        activities.append({
            "id": f"note-{n.created_date.timestamp()}",
            "activity_type": "note_completed",
            "message": f"Chart note completed for {n.name}",
            "timestamp": n.created_date
        })
    for p in recent_prescriptions:
        activities.append({
            "id": f"pres-{p.created_date.timestamp()}",
            "activity_type": "prescription",
            "message": f"Prescription written for {p.name} ({p.medicine_name})",
            "timestamp": p.created_date
        })
    
    # Sort unified feed by timestamp descending and take top 5
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    activities = activities[:5]

    # Queue list processing
    queue_list = []
    for appt in appointments:
        reason = appt.note_complaint or appt.triage_summary or "Consultation"
        patient_age = 35  # fallback demo age

        queue_list.append({
            "patient_guid": appt.patient_guid,
            "patient_name": appt.patient_name,
            "age": patient_age,
            "appointment_guid": appt.appointment_guid,
            "scheduled_start": appt.scheduled_start,
            "reason": reason,
            "appointment_status": appt.appointment_status
        })

    return {
        "doctor_guid": doctor_guid,
        "date": target_date,
        "kpis": {
            "patients_today": patients_today,
            "patients_remaining": patients_remaining,
            "total_appointments": total_appts,
            "next_appointment_time": next_time_str,
            "pending_notes": pending_notes,
            "avg_consult_duration_minutes": round(avg_duration, 1)
        },
        "queue": queue_list,
        "recent_activities": activities
    }
