"""Controller for ambient recording session endpoints.

Handles: session creation, chunk upload, session end (triggers transcription),
SSE event stream for real-time updates via PostgreSQL LISTEN/NOTIFY.
"""

import asyncio
import json
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from model.app_mda_appointment_session import AppMdaAppointmentSession
from service.app_mda_appointment_session_service import appointment_session_service
from service.app_mda_follow_up_queue_service import follow_up_queue_service
from util.database import get_db
from util.gcs import upload_chunk, compose_chunks
from util.pg_notify import register_queue, unregister_queue, send_notify
from util.dummy_agents import generate_transcript, generate_report, generate_follow_up_message, parse_appointment_note
from model.app_mda_appointment_note import AppMdaAppointmentNote

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


def _process_session_pipeline(session_guid: str, db_session_factory):
    """Background task: 3-step pipeline with pg_notify after each step.

    Step 1: Generate transcript (from audio or dummy)
    Step 2: Generate AI report (clinical insights, treatment plan)
    Step 3: Generate follow-up message (patient-friendly notification)

    After each step, commit to DB then fire pg_notify so the SSE stream
    pushes the update to the frontend in real-time.
    """
    print(f"\n{'='*60}")
    print(f"[PIPELINE] Starting pipeline for session: {session_guid}")
    print(f"{'='*60}")

    db = db_session_factory()
    try:
        session_record = appointment_session_service.get_by_guid(db, uuid.UUID(session_guid))
        if not session_record:
            print(f"[PIPELINE] ERROR: Session {session_guid} not found in DB")
            return

        doctor_guid = str(session_record.doctor_guid)
        appointment_guid = str(session_record.appointment_guid)
        print(f"[PIPELINE] Doctor: {doctor_guid}")
        print(f"[PIPELINE] Appointment: {appointment_guid}")

        # ── Step 1: Generate Transcript ──────────────────────────────────────
        print(f"\n[PIPELINE] ── Step 1/3: Generating Transcript ──")
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {"transcription_status": "transcribing"}
        )

        # Compose chunks into a single file (GCS)
        print(f"[PIPELINE]   Composing audio chunks from GCS...")
        merged_uri = compose_chunks(
            session_guid=session_guid,
            clinic_guid=CLINIC_GUID,
            doctor_guid=doctor_guid,
            appointment_guid=appointment_guid,
        )
        print(f"[PIPELINE]   Merged audio URI: {merged_uri}")

        # Store the merged audio URL
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {"audio_stream_url": merged_uri}
        )

        # Generate transcript (using dummy for now — swap to real transcription later)
        print(f"[PIPELINE]   Running transcription...")
        transcript = generate_transcript(merged_uri)
        print(f"[PIPELINE]   Transcript generated ({len(transcript)} chars)")

        # Commit transcript to DB
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {
                "transcript": transcript,
                "transcription_status": "transcript_complete",
            }
        )
        print(f"[PIPELINE]   ✓ Transcript saved to DB")

        # Fire NOTIFY → SSE for transcript completion
        print(f"[PIPELINE]   Firing pg_notify: transcription_complete")
        send_notify(db, doctor_guid, "transcription_complete", {
            "session_guid": session_guid,
            "appointment_guid": appointment_guid,
            "transcript": transcript,
        })
        print(f"[PIPELINE]   ✓ NOTIFY sent for transcription_complete")

        # ── Step 2: Generate Report ─────────────────────────────────────────
        print(f"\n[PIPELINE] ── Step 2/3: Generating Report ──")
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {"transcription_status": "generating_report"}
        )

        # Fetch appointment note record for clinical audit context
        print(f"[PIPELINE]   Fetching appointment note for appointment {appointment_guid[:8]}...")
        appointment_note_record = (
            db.query(AppMdaAppointmentNote)
            .filter(AppMdaAppointmentNote.appointment_guid == uuid.UUID(appointment_guid))
            .first()
        )
        appointment_note_str = parse_appointment_note(appointment_note_record)
        if appointment_note_record:
            print(f"[PIPELINE]   ✓ Appointment note found")
        else:
            print(f"[PIPELINE]   ⚠ No appointment note found (will note in audit)")

        print(f"[PIPELINE]   Running report agent (Gemini 2.5 Flash)...")
        report = generate_report(transcript, session_guid, appointment_note_str)
        print(f"[PIPELINE]   Report generated with keys: {list(report.keys())}")

        # Commit report to DB (stored in transcript_metadata JSON column)
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {
                "transcript_metadata": report,
                "transcription_status": "report_complete",
            }
        )
        print(f"[PIPELINE]   ✓ Report saved to DB (transcript_metadata)")

        # Fire NOTIFY → SSE for report completion
        print(f"[PIPELINE]   Firing pg_notify: report_generated")
        send_notify(db, doctor_guid, "report_generated", {
            "session_guid": session_guid,
            "appointment_guid": appointment_guid,
            "report": report,
        })
        print(f"[PIPELINE]   ✓ NOTIFY sent for report_generated")

        # ── Step 3: Generate Follow-Up Message ───────────────────────────────
        print(f"\n[PIPELINE] ── Step 3/3: Generating Follow-Up Message ──")
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {"transcription_status": "generating_followup"}
        )

        print(f"[PIPELINE]   Running follow-up agent...")
        follow_up_msg = generate_follow_up_message(transcript, session_guid)
        print(f"[PIPELINE]   Follow-up message generated ({len(follow_up_msg)} chars)")

        # Store in follow_up_queue table
        follow_up_data = {
            "appointment_guid": uuid.UUID(appointment_guid),
            "patient_guid": None,  # Would come from appointment record in production
            "follow_up_msg": follow_up_msg,
            "follow_up_status": "pending",
            "status": "active",
        }
        follow_up_record = follow_up_queue_service.create(db, follow_up_data)
        print(f"[PIPELINE]   ✓ Follow-up record created: {follow_up_record.guid}")

        # Mark session as fully completed
        appointment_session_service.update(
            db, uuid.UUID(session_guid), {"transcription_status": "completed"}
        )

        # Fire NOTIFY → SSE for follow-up completion
        print(f"[PIPELINE]   Firing pg_notify: followup_queued")
        send_notify(db, doctor_guid, "followup_queued", {
            "session_guid": session_guid,
            "appointment_guid": appointment_guid,
            "followup_guid": str(follow_up_record.guid),
            "follow_up_msg": follow_up_msg,
        })
        print(f"[PIPELINE]   ✓ NOTIFY sent for followup_queued")

        print(f"\n{'='*60}")
        print(f"[PIPELINE] ✓ Pipeline COMPLETE for session: {session_guid}")
        print(f"{'='*60}\n")

    except Exception as e:
        # Mark as failed
        print(f"\n[PIPELINE] ✗ FAILED for session {session_guid}: {e}")
        try:
            appointment_session_service.update(
                db, uuid.UUID(session_guid), {"transcription_status": "failed"}
            )
            send_notify(db, doctor_guid, "pipeline_failed", {
                "session_guid": session_guid,
                "error": str(e),
            })
        except Exception as notify_err:
            print(f"[PIPELINE]   Failed to send failure notification: {notify_err}")
        print(f"Pipeline failed for session {session_guid}: {e}")
    finally:
        db.close()


@router.post("/end")
def end_session(
    session_guid: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """End the recording session and trigger the async 3-step pipeline."""
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

    # Kick off the 3-step background pipeline
    background_tasks.add_task(_process_session_pipeline, session_guid, SessionLocal)

    return {
        "status": "processing",
        "session_guid": session_guid,
    }


@router.get("/status/{session_guid}")
def get_session_status(
    session_guid: str,
    db: Session = Depends(get_db),
):
    """Get current session status (fallback if SSE is not connected)."""
    session_record = appointment_session_service.get_by_guid(db, uuid.UUID(session_guid))
    if not session_record:
        raise HTTPException(status_code=404, detail="Session not found")

    result = {
        "session_guid": session_guid,
        "transcription_status": session_record.transcription_status,
        "transcript": None,
        "report": None,
    }

    if session_record.transcription_status in ("transcript_complete", "report_complete", "completed"):
        result["transcript"] = session_record.transcript

    if session_record.transcription_status in ("report_complete", "completed"):
        result["report"] = session_record.transcript_metadata

    return result


# ─── SSE Endpoint ─────────────────────────────────────────────────────────────

@router.get("/events/{doctor_guid}")
async def session_events_stream(
    doctor_guid: str,
    request: Request,
):
    """Server-Sent Events stream for a doctor.

    The frontend opens a single EventSource connection per doctor session.
    Events are pushed in real-time as the background pipeline progresses
    for ANY of that doctor's appointment sessions.

    Event types:
      - transcription_complete
      - report_generated
      - followup_queued
      - pipeline_failed
    """

    async def event_generator():
        queue = register_queue(doctor_guid)
        print(f"[SSE] Client connected for doctor {doctor_guid[:8]}... (queue registered)")
        try:
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    print(f"[SSE] Client disconnected for doctor {doctor_guid[:8]}...")
                    break

                try:
                    # Wait for next event with a timeout (sends keepalive)
                    payload = await asyncio.wait_for(queue.get(), timeout=30.0)
                    event_type = payload.get("event", "message")
                    data = json.dumps(payload)
                    print(f"[SSE] Yielding event: {event_type} to doctor {doctor_guid[:8]}...")
                    yield f"event: {event_type}\ndata: {data}\n\n"
                except asyncio.TimeoutError:
                    # Send keepalive comment to prevent connection timeout
                    yield ": keepalive\n\n"
        finally:
            unregister_queue(doctor_guid, queue)
            print(f"[SSE] Queue unregistered for doctor {doctor_guid[:8]}...")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx/proxy buffering
        },
    )
