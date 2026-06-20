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


def parse_report_as_string(report: dict) -> str:
    """Parse a generated report dict into a human-readable string.

    Used as input context for the follow-up message LLM call.

    Args:
        report: The report dict returned by generate_report().

    Returns:
        A formatted multi-line string summarizing the report.
    """
    lines = []

    # Clinical Insights
    clinical_insights = report.get("clinical_insights", {})
    summary = clinical_insights.get("summary", "")
    if summary:
        lines.append(f"Clinical Insights Summary: {summary}")

    key_observations = clinical_insights.get("key_observations", [])
    for i, obs in enumerate(key_observations, 1):
        lines.append(f"Key Observation {i}: {obs}")

    red_flags = clinical_insights.get("red_flags", [])
    if red_flags:
        for i, flag in enumerate(red_flags, 1):
            lines.append(f"Red Flag {i}: {flag}")
    else:
        lines.append("Red Flags: None")

    # Patient Instructions
    patient_instructions = report.get("patient_instructions", {})
    lifestyle_and_diet = patient_instructions.get("lifestyle_and_diet", [])
    for i, item in enumerate(lifestyle_and_diet, 1):
        lines.append(f"Lifestyle and Diet {i}: {item}")

    care_plan_steps = patient_instructions.get("care_plan_steps", [])
    for i, step in enumerate(care_plan_steps, 1):
        lines.append(f"Care Plan Step {i}: {step}")

    # Clinical Audit
    clinical_audit = report.get("clinical_audit", {})
    form_discrepancies = clinical_audit.get("form_discrepancies", [])
    if form_discrepancies:
        for i, discrepancy in enumerate(form_discrepancies, 1):
            lines.append(f"Form Discrepancy {i}: {discrepancy}")
    else:
        lines.append("Form Discrepancies: None")

    patient_comprehension = clinical_audit.get("patient_comprehension_rating", "")
    if patient_comprehension:
        lines.append(f"Patient Comprehension Rating: {patient_comprehension}")

    return "\n".join(lines)


def generate_follow_up_message(transcript: str, session_guid: str, report: dict | None = None) -> str:
    """Generate a patient follow-up message using Gemini 2.5 Flash.

    Uses the parsed report string as context for the LLM to generate
    a concise follow-up message (max 30 words in body, no emojis).

    Args:
        transcript: The full consultation transcript (unused if report is available).
        session_guid: The session GUID (for logging).
        report: The generated report dict. If provided, it's parsed and used as context.

    Returns:
        The follow-up message text to be stored in `follow_up_msg` column.
    """
    from service.app_mda_inference_service import generate_followup_from_llm

    print(f"[generate_follow_up] Calling Gemini 2.5 Flash for session {session_guid[:8]}...")

    # Parse the report into a string for the LLM context
    if report:
        report_summary_str = parse_report_as_string(report)
    else:
        # Fallback: use transcript directly if no report available
        report_summary_str = f"Transcript excerpt:\n{transcript[:500]}"

    follow_up_msg = generate_followup_from_llm(report_summary_str)

    return follow_up_msg
