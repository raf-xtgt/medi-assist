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


def _create_triage_agent(doctors_context_string: str) -> Agent:
    """Create a triage agent with the clinic's doctor roster injected into the prompt."""
    return Agent(
        name="clinic_triage_agent",
        model="gemini-2.5-flash",
        instruction=f"""You are the primary AI Triage Helpdesk Assistant for our medical clinic.

Your goal is to:
1. Evaluate user symptoms empathetically without giving definitive diagnoses.
2. Ask clarifying questions to understand the severity and duration.
3. Match the patient's condition to the most qualified doctor from the list below.
4. Once matched, explicitly recommend the doctor by name and specialty, and guide the user to confirm an appointment.

## Rules
- Never provide a medical diagnosis. You are a triage assistant, not a doctor.
- Be warm, concise, and professional.
- If symptoms sound urgent (chest pain, difficulty breathing, severe bleeding), immediately advise the patient to call emergency services.
- Always recommend exactly ONE doctor who best matches the symptoms.
- End your response by asking if they'd like to book an appointment with the recommended doctor.

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

        return TriageResponseDto(response_text=response_text)

    except Exception as e:
        print(f"[TriageChat] ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))
