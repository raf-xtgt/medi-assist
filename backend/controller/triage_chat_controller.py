"""Controller for AI-powered triage chat endpoint."""

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from model.dto.triage_dto import TriageRequestDto, TriageResponseDto
from model.app_mda_lead_chat_transcript import AppMdaLeadChatTranscript
from service.inference.patient_triage_inference_service import parse_doctor_info
from util.database import get_db

router = APIRouter(prefix="/triage", tags=["triage_chat"])

# ─── ADK Session Service (in-memory for stateless per-request) ────────────────
_session_service = InMemorySessionService()

APP_NAME = "mediassist_triage"


def _detect_booking_recommendation(response_text: str) -> bool:
    """
    Detect if the agent's response contains a doctor recommendation with a booking prompt.

    Heuristic: if the response mentions both a doctor recommendation keyword
    and an appointment/booking prompt, set booking_flag to True.
    """
    text_lower = response_text.lower()
    # Check for doctor recommendation signals
    has_recommendation = any(phrase in text_lower for phrase in [
        "i'd recommend",
        "i recommend",
        "i would recommend",
        "best match",
        "good fit",
        "well-suited",
        "specializes in",
        "would be a great",
        "dr.",
    ])
    # Check for booking prompt signals
    has_booking_prompt = any(phrase in text_lower for phrase in [
        "book an appointment",
        "schedule an appointment",
        "like to book",
        "set up an appointment",
        "like me to book",
        "want to book",
        "shall i book",
    ])
    return has_recommendation and has_booking_prompt


def _extract_recommended_doctor_name(response_text: str) -> str | None:
    """
    Extract the recommended doctor's name from the agent response.

    Looks for patterns like "Dr. Jane Smith", "Dr Jane Smith", or
    names following recommendation phrases.
    """
    import re

    # Pattern 1: "Dr." or "Dr" followed by a name (1-3 capitalized words)
    dr_pattern = re.search(r'\bDr\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})', response_text)
    if dr_pattern:
        return f"Dr. {dr_pattern.group(1)}"

    # Pattern 2: After recommendation phrases, look for a proper noun
    rec_phrases = [
        r"(?:I(?:'d)?\s+recommend|I\s+would\s+recommend|best\s+match\s+is|good\s+fit\s+would\s+be)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})",
    ]
    for pattern in rec_phrases:
        match = re.search(pattern, response_text)
        if match:
            return match.group(1)

    return None


def _create_triage_agent(doctors_context_string: str) -> Agent:
    """Create a triage agent with the clinic's doctor roster injected into the prompt."""
    return Agent(
        name="clinic_triage_agent",
        model="gemini-2.5-flash",
        instruction=f"""You are the primary AI Triage Helpdesk Assistant for our medical clinic.

Your goal is to gather enough information about the patient's condition to recommend the most suitable doctor from our clinic roster.

## Information Gathering Phase

Before recommending a doctor, you MUST collect ALL of the following:
1. **Primary complaint** — What symptoms or issues are they experiencing?
2. **Severity** — How severe is it on a scale of 1-10?
3. **Duration** — How long have they been experiencing this?
4. **Recurrence** — Is this the first time, or has it happened before?

Ask ONE clarifying question at a time. Do not overwhelm the patient with multiple questions in a single response. Be warm, empathetic, and conversational.

## Decision Logic

- If you do NOT yet have all 4 pieces of information above, ask the next missing question. Do NOT recommend a doctor yet.
- If you DO have all 4 pieces of information, proceed to the Recommendation Phase.

## Recommendation Phase (only after all info is collected)

Once you have sufficient information:
1. Match the patient's condition to the most qualified doctor from the list below.
2. Recommend exactly ONE doctor by name and specialty.
3. Briefly explain why this doctor is a good match.
4. Ask if they'd like to book an appointment with the recommended doctor.

## Safety Rules
- Never provide a medical diagnosis. You are a triage assistant, not a doctor.
- If symptoms sound urgent (chest pain, difficulty breathing, severe bleeding, loss of consciousness), immediately advise the patient to call emergency services (911) and skip the information gathering.
- Keep responses concise (2-4 sentences max per turn).

## Available Doctors at Our Clinic:
{doctors_context_string}
""",
    )


@router.post("/trigger-chat", response_model=TriageResponseDto)
async def trigger_chat(payload: TriageRequestDto, db: Session = Depends(get_db)):
    """
    Process a triage chat turn.

    1. Persists the buffered transcript records to the database.
    2. Retrieves the clinic's doctor roster for LLM context.
    3. Runs the ADK triage agent with the combined user message.
    4. Returns the AI response text.
    """
    try:
        # Step 1: Create transcript records in bulk
        for transcript in payload.transcripts:
            record = AppMdaLeadChatTranscript(
                guid=uuid.uuid4(),
                chat_hdr_guid=payload.chat_hdr_guid,
                msg_content=transcript.msg_content,
                sender=transcript.sender,
            )
            db.add(record)
        db.commit()

        # Step 2: Get doctor context string
        doctors_summary = parse_doctor_info(db, limit=50)

        # Step 3: Create the triage agent with doctor context
        triage_agent = _create_triage_agent(doctors_summary)

        # Step 4: Create session and run the agent
        session_id = str(payload.chat_hdr_guid) if payload.chat_hdr_guid else str(uuid.uuid4())
        user_id = "patient"

        # Try to get existing session, create if it doesn't exist
        session = await _session_service.get_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=session_id,
        )
        if not session:
            session = await _session_service.create_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id,
            )

        runner = Runner(
            agent=triage_agent,
            app_name=APP_NAME,
            session_service=_session_service,
        )

        # Build the Content object with role and parts (required by ADK Runner)
        user_content = types.Content(
            role="user",
            parts=[types.Part(text=payload.combined_user_msg)],
        )

        # Run the agent with the properly typed message
        response_text = ""
        async for event in runner.run_async(
            session_id=session.id,
            user_id=user_id,
            new_message=user_content,
        ):
            if event.is_final_response() and event.content and event.content.parts:
                for part in event.content.parts:
                    if hasattr(part, "text") and part.text:
                        response_text += part.text

        if not response_text:
            response_text = "I'm sorry, I wasn't able to process your message. Could you please rephrase your symptoms?"

        # Determine booking_flag: if the agent recommends a doctor and asks to book
        booking_flag = _detect_booking_recommendation(response_text)

        # Extract recommended doctor name if booking was detected
        recommended_doctor_name = None
        if booking_flag:
            recommended_doctor_name = _extract_recommended_doctor_name(response_text)

        return TriageResponseDto(
            response_text=response_text,
            booking_flag=booking_flag,
            recommended_doctor_name=recommended_doctor_name,
        )

    except Exception as e:
        print(f"[TriageChat] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
