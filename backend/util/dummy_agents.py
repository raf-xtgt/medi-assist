"""Dummy agent functions for testing the end-to-end SSE pipeline.

Each function simulates what a real Google ADK SequentialAgent would produce.
Replace the body of each function with actual agent calls when ready.
"""

import time


def generate_transcript(merged_audio_uri: str) -> str:
    """Simulate transcript generation from audio.

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


def generate_report(transcript: str, session_guid: str) -> dict:
    """Simulate AI report generation from transcript.

    In production: replace with Google ADK SequentialAgent invocation:
      - Sub-agent A: AppointmentKeyPointsGenerator
      - Sub-agent B: PatientFileGeneratorAgent

    Returns a dict suitable for storing in `transcript_metadata` JSON column.
    """
    # Simulate processing delay
    time.sleep(2)

    return {
        "clinical_summary": {
            "chief_complaint": "Follow-up consultation — headache improvement, new onset morning dizziness",
            "diagnosis": "Orthostatic hypotension (positional blood pressure drop)",
            "severity": "mild",
        },
        "vitals_extracted": {
            "bp_sitting": "128/82 mmHg",
            "bp_standing": "110/70 mmHg",
            "positional_drop": True,
        },
        "key_findings": [
            "Headaches significantly improved after medication adjustment",
            "New symptom: morning dizziness on standing",
            "Confirmed orthostatic hypotension via positional BP measurement",
            "Positional drop of 18 mmHg systolic",
        ],
        "treatment_plan": [
            "Reduce Amlodipine 10mg → 5mg daily",
            "Low-sodium diet recommendation",
            "Patient education: slow positional changes",
            "Follow-up in 2 weeks for BP recheck",
        ],
        "medications_changed": [
            {
                "medication": "Amlodipine",
                "previous_dose": "10mg daily",
                "new_dose": "5mg daily",
                "reason": "Orthostatic hypotension management",
            }
        ],
        "risk_flags": [],
        "generated_by": "dummy_agent",
        "session_guid": session_guid,
    }


def generate_follow_up_message(transcript: str, session_guid: str) -> str:
    """Simulate follow-up message generation from transcript.

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
