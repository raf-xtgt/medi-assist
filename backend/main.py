"""FastAPI application entrypoint with all table routers."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controller.app_mda_user_controller import router as user_router
from controller.app_mda_prmn_controller import router as prmn_router
from controller.app_mda_clinic_hdr_controller import router as clinic_hdr_router
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

app = FastAPI(
    title="Medi-Assist API",
    description="Backend API for the Medi-Assist digital health platform",
    version="1.0.0",
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


# Register all table routers
app.include_router(user_router)
app.include_router(prmn_router)
app.include_router(clinic_hdr_router)
app.include_router(doctor_router)
app.include_router(doctor_cred_router)
app.include_router(patient_lead_router)
app.include_router(patient_router)
app.include_router(doctor_patient_link_router)
app.include_router(doctor_availability_router)
app.include_router(appointment_router)
app.include_router(appointment_session_router)
app.include_router(prescription_router)
app.include_router(follow_up_queue_router)
