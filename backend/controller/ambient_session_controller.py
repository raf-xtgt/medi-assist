"""Controller for ambient recording session endpoints.

Handles: session creation, chunk upload, session end (triggers transcription).
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from model.app_mda_appointment_session import AppMdaAppointmentSession
from service.app_mda_appointment_session_service import appointment_session_service
from util.database import get_db
from util.gcs import upload_chunk, compose_chunks
from util.transcription import transcribe_audio

router = APIRouter(prefix="/ambient-session", tags=["ambient_session"])

# Hardcoded clinic guid for now (single-clinic MVP)
CLINIC_GUID = "00000000-0000-0000-0000-000000000001"


@router.post("/start")
def start_session(
    appointment_guid: str,
    doctor_guid: str,
    db: Session = Depends(get_db),
):
    """Create a new appointment session record and return the session_guid.

    The frontend will use this session_guid for all subsequent chunk uploads.
    """
    data = {
        "appointment_guid": uuid.UUID(appointment_guid),
        "doctor_guid": uuid.UUID(doctor_guid),
        "transcription_status": "recording",
        "status": "active",
        "is_reviewed_by_doctor": False,
    }
    session_record = appointment_session_service.create(db, data)
    return {
        "session_guid": str(session_record.guid),
        "status": "recording",
    }


@router.post("/upload-chunk")
async def upload_audio_chunk(
    session_guid: str = Form(...),
    chunk_index: int = Form(...),
    timestamp_ms: int = Form(0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Receive an audio chunk and upload it directly to GCS."""
    # Validate session exists
    session_record = appointment_session_service.get_by_guid(db, uuid.UUID(session_guid))
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_record.transcription_status != "recording":
        raise HTTPException(status_code=400, detail="Session is not in recording state")

    # Read file content
    file_data = await file.read()

    # Upload to GCS
    doctor_guid = str(session_record.doctor_guid)
    appointment_guid = str(session_record.appointment_guid)

    gcs_uri = upload_chunk(
        session_guid=session_guid,
        clinic_guid=CLINIC_GUID,
        doctor_guid=doctor_guid,
        appointment_guid=appointment_guid,
        chunk_index=chunk_index,
        file_data=file_data,
        content_type=file.content_type or "audio/webm",
    )

    return {
        "status": "uploaded",
        "chunk_index": chunk_index,
        "gcs_uri": gcs_uri,
    }


def _process_transcription(session_guid: str, db_session_factory):
    """Background task: compose chunks and transcribe."""
    db = db_session_factory()
    try:
        session_record = appointment_session_service.get_by_guid(db, uuid.UUID(session_guid))
        if not session_record:
            return

        doctor_guid = str(session_record.doctor_guid)
        appointment_guid = str(session_record.appointment_guid)

        # Update status to processing
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {"transcription_status": "processing"}
        )

        # Compose chunks into a single file
        merged_uri = compose_chunks(
            session_guid=session_guid,
            clinic_guid=CLINIC_GUID,
            doctor_guid=doctor_guid,
            appointment_guid=appointment_guid,
        )

        # Store the merged audio URL
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {"audio_stream_url": merged_uri}
        )

        # Transcribe
        transcript = transcribe_audio(merged_uri)

        # Save transcript to DB
        appointment_session_service.update(
            db,
            uuid.UUID(session_guid),
            {
                "transcript": transcript,
                "transcription_status": "completed",
            },
        )
    except Exception as e:
        # Mark as failed
        try:
            appointment_session_service.update(
                db,
                uuid.UUID(session_guid),
                {"transcription_status": "failed"},
            )
        except Exception:
            pass
        print(f"Transcription failed for session {session_guid}: {e}")
    finally:
        db.close()


@router.post("/end")
def end_session(
    session_guid: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """End the recording session and trigger async transcription."""
    session_record = appointment_session_service.get_by_guid(db, uuid.UUID(session_guid))
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_record.transcription_status != "recording":
        raise HTTPException(status_code=400, detail="Session is not in recording state")

    # Update status immediately
    appointment_session_service.update(
        db, uuid.UUID(session_guid), {"transcription_status": "processing"}
    )

    # Import SessionLocal for background task (needs its own DB session)
    from util.database import SessionLocal

    # Kick off background transcription
    background_tasks.add_task(_process_transcription, session_guid, SessionLocal)

    return {
        "status": "processing",
        "session_guid": session_guid,
    }


@router.get("/status/{session_guid}")
def get_session_status(
    session_guid: str,
    db: Session = Depends(get_db),
):
    """Poll for transcription status and return transcript when ready."""
    session_record = appointment_session_service.get_by_guid(db, uuid.UUID(session_guid))
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    result = {
        "session_guid": session_guid,
        "transcription_status": session_record.transcription_status,
        "transcript": None,
    }

    if session_record.transcription_status == "completed":
        result["transcript"] = session_record.transcript

    return result
