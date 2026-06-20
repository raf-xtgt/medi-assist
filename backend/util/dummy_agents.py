"""Agent functions for the ambient session pipeline.

- generate_transcript: Returns dummy transcript (swap to real Speech-to-Text later)
- parse_appointment_note: Formats an AppMdaAppointmentNote record as a string
- generate_report: Uses Gemini 2.5 Flash via inference service for real LLM output
- generate_follow_up_message: Returns dummy follow-up (swap to real agent later)
"""

import time
from typing import Any


def generate_transcript(merged_audio_uri: str) -> str:
    """Return a dummy transcript for testing.

    In production: replace with call to `transcribe_audio(merged_audio_uri)`
    from util/transcription.py (Google Cloud Speech-to-Text V2).
    """
    # Simulate processing delay
    time.sleep(2)

    return (
        "Doctor: Good morning, Mrs. Santos. How have you been feeling since our last visit?\n\n"
        "Patient: Good morning, Doctor. Overall I've been feeling better. The headaches have "
        "reduced significantly since we adjusted the medication. But I've noticed some "
        "dizziness in the mornings when I stand up.\n\n"
        "Doctor: That's encouraging about the headaches. The dizziness you're describing "
        "sounds like orthostatic hypotension — a drop in blood pressure when you change "
        "position. Let me check your vitals. Your blood pressure is 128 over 82 sitting, "
        "and 110 over 70 standing. That confirms a positional drop.\n\n"
        "Patient: Is that something to worry about?\n\n"
        "Doctor: It's manageable. I'd like to reduce your Amlodipine from 10mg to 5mg and "
        "add a low-sodium diet recommendation. Make sure you stand up slowly, especially "
        "in the morning. Let's follow up in two weeks to recheck.\n\n"
        "Patient: That sounds good. Thank you, Doctor.\n\n"
        "Doctor: You're welcome. My assistant will schedule your follow-up. Take care."
    )


def parse_appointment_note(note_record: Any) -> str:
    """Parse an AppMdaAppointmentNote SQLAlchemy record into a human-readable string.

    Args:
        note_record: An AppMdaAppointmentNote ORM instance, or None.

    Returns:
        A formatted string representation of the appointment note fields.
        If no record is provided, returns a message indicating unavailability.
    """
    if note_record is None:
        return "No appointment note form available for this appointment."

    fields = {
        "Main Complaint": note_record.main_complaint,
        "Blood Pressure": note_record.blood_pressure,
        "Heart Rate": str(note_record.heart_rate) if note_record.heart_rate is not None else None,
        "Temperature": str(note_record.temperature) if note_record.temperature is not None else None,
        "Respiratory Rate": str(note_record.respiratory_rate) if note_record.respiratory_rate is not None else None,
        "Oxygen Saturation": str(note_record.oxygen_saturation) if note_record.oxygen_saturation is not None else None,
        "Weight": str(note_record.weight) if note_record.weight is not None else None,
        "Additional Remarks": note_record.additional_remarks,
    }

    lines = []
    for label, value in fields.items():
        display_value = value if value else "Not recorded"
        lines.append(f"{label}: {display_value}")

    return "\n".join(lines)


def generate_report(transcript: str, session_guid: str, appointment_note_str: str = "") -> dict:
    """Generate a structured clinical report using Gemini 2.5 Flash via Vertex AI.

    Calls the inference service which sends the transcript and appointment note
    to the LLM and receives a structured JSON report back.

    Args:
        transcript: The full consultation transcript text.
        session_guid: The session GUID (for logging/tagging).
        appointment_note_str: Parsed appointment note form as a string.

    Returns:
        A dict matching the report schema for storing in transcript_metadata.
    """
    from service.app_mda_inference_service import generate_report_from_llm

    print(f"[generate_report] Calling Gemini 2.5 Flash for session {session_guid[:8]}...")

    # If no appointment note string is provided, use a default message
    if not appointment_note_str:
        appointment_note_str = "No appointment note form available for this appointment."

    report = generate_report_from_llm(transcript, appointment_note_str)

    # Tag with metadata
    report["generated_by"] = "gemini-2.5-flash"
    report["session_guid"] = session_guid

    return report


def generate_follow_up_message(transcript: str, session_guid: str) -> str:
    """Return a dummy follow-up message for testing.

    In production: replace with Google ADK FollowUpGeneratorAgent that drafts
    a patient-friendly SMS/WhatsApp message.

    Returns the message text to be stored in `follow_up_msg` column.
    """
    # Simulate processing delay
    time.sleep(1)

    return (
        "Hi Mrs. Santos 👋\n\n"
        "This is a reminder from Dr. Clarke's clinic regarding your visit today:\n\n"
        "✅ Your headaches are improving — great progress!\n"
        "💊 Medication update: Amlodipine reduced to 5mg (from 10mg). "
        "Please start the new dose tomorrow morning.\n"
        "🧂 Try to reduce salt in your diet.\n"
        "⚠️ Stand up slowly, especially in the mornings, to avoid dizziness.\n\n"
        "📅 Your follow-up is scheduled in 2 weeks. "
        "We'll recheck your blood pressure then.\n\n"
        "If you experience severe dizziness, fainting, or chest pain, "
        "please contact us immediately or visit the ER.\n\n"
        "Take care! 🙏\n"
        "— Dr. Clarke's Clinic"
    )
