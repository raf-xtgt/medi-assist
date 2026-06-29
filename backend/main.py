"""FastAPI application entrypoint with all table routers."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from util.pg_notify import start_listener, stop_listener


# ─── Lifespan: start/stop the PostgreSQL LISTEN connection ────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the asyncpg LISTEN connection lifecycle."""
    conn = await start_listener()
    app.state.pg_listen_conn = conn
    yield
    await stop_listener(conn)

from controller.app_mda_user_controller import router as user_router
from controller.app_mda_prmn_controller import router as prmn_router
from controller.app_mda_clinic_hdr_controller import router as clinic_hdr_router, public_router as clinic_public_router
from controller.app_mda_doctor_controller import router as doctor_router
from controller.app_mda_doctor_cred_controller import router as doctor_cred_router
from controller.app_mda_patient_lead_controller import router as patient_lead_router
from controller.app_mda_patient_controller import router as patient_router
from controller.app_mda_doctor_patient_link_controller import router as doctor_patient_link_router
from controller.app_mda_doctor_availability_controller import router as doctor_availability_router
from controller.app_mda_appointment_controller import router as appointment_router
from controller.app_mda_appointment_session_controller import router as appointment_session_router
from controller.app_mda_prescription_controller import router as prescription_router
from controller.app_mda_follow_up_queue_controller import router as follow_up_queue_router
from controller.app_mda_appointment_note_controller import router as appointment_note_router
from controller.ambient_session_controller import router as ambient_session_router
from controller.app_mda_lead_chat_hdr_controller import router as lead_chat_hdr_router
from controller.app_mda_lead_chat_transcript_controller import router as lead_chat_transcript_router
from controller.app_mda_inferencing_controller import router as inferencing_router
from controller.app_mda_clinical_report_controller import router as clinical_report_router
from controller.triage_chat_controller import router as triage_chat_router
from controller.app_mda_dashboard_controller import router as dashboard_router


app = FastAPI(
    title="Medi-Assist API",
    description="Backend API for the Medi-Assist digital health platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow Postman / frontend / any origin during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/agent/status")
def get_status():
    return {"status": "active"}

url_prefix = "/api/mda"
# Register all table routers
app.include_router(user_router, prefix=url_prefix)
app.include_router(prmn_router, prefix=url_prefix)
app.include_router(clinic_hdr_router, prefix=url_prefix)
app.include_router(clinic_public_router, prefix="/api")
app.include_router(doctor_router, prefix=url_prefix)
app.include_router(doctor_cred_router, prefix=url_prefix)
app.include_router(patient_lead_router, prefix=url_prefix)
app.include_router(patient_router, prefix=url_prefix)
app.include_router(doctor_patient_link_router, prefix=url_prefix)
app.include_router(doctor_availability_router, prefix=url_prefix)
app.include_router(appointment_router, prefix=url_prefix)
app.include_router(appointment_session_router, prefix=url_prefix)
app.include_router(prescription_router, prefix=url_prefix)
app.include_router(follow_up_queue_router, prefix=url_prefix)
app.include_router(appointment_note_router, prefix=url_prefix)
app.include_router(clinical_report_router, prefix=url_prefix)
app.include_router(ambient_session_router, prefix="/api/agent")
app.include_router(triage_chat_router, prefix="/api/agent")
app.include_router(lead_chat_hdr_router, prefix=url_prefix)
app.include_router(lead_chat_transcript_router, prefix=url_prefix)
app.include_router(inferencing_router, prefix="/api/agent")
app.include_router(dashboard_router, prefix=url_prefix)

