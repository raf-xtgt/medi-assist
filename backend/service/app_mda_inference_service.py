"""Inference service for LLM-powered report generation.

Uses Google Vertex AI (Gemini 2.5 Flash) to generate structured clinical
reports from appointment transcripts and clinical notes.
"""

import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# ─── Client initialization ───────────────────────────────────────────────────
# GOOGLE_GENAI_USE_VERTEXAI=TRUE in .env ensures Vertex AI backend is used.
# The SDK reads GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, and
# GOOGLE_APPLICATION_CREDENTIALS automatically.
_client = genai.Client()

# Model for report generation
REPORT_MODEL = "gemini-2.5-flash"


# ─── Output schema (enforced via response_schema) ────────────────────────────
REPORT_SCHEMA = {
    "type": "object",
    "properties": {
        "clinical_insights": {
            "type": "object",
            "properties": {
                "summary": {
                    "type": "string",
                    "description": "A 2-3 sentence concise narrative synthesizing the clinical encounter."
                },
                "key_observations": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Key clinical observations extracted from the transcript."
                },
                "red_flags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Any red flags or warnings identified. Empty array if none."
                }
            },
            "required": ["summary", "key_observations", "red_flags"]
        },
        "patient_instructions": {
            "type": "object",
            "properties": {
                "lifestyle_and_diet": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lifestyle and dietary instructions for the patient."
                },
                "care_plan_steps": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Step-by-step care plan actions for the patient."
                }
            },
            "required": ["lifestyle_and_diet", "care_plan_steps"]
        },
        "clinical_audit": {
            "type": "object",
            "properties": {
                "form_discrepancies": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Discrepancies between the verbal transcript and the structured clinical form."
                },
                "patient_comprehension_rating": {
                    "type": "string",
                    "description": "Assessment of patient understanding: High, Medium, or Low with brief justification."
                }
            },
            "required": ["form_discrepancies", "patient_comprehension_rating"]
        }
    },
    "required": ["clinical_insights", "patient_instructions", "clinical_audit"]
}


# ─── Prompt template ─────────────────────────────────────────────────────────
REPORT_PROMPT_TEMPLATE = """You are a clinical documentation AI assistant for a healthcare platform. Your task is to generate a structured post-visit report from a doctor-patient consultation transcript and the structured appointment note form filled by the doctor.

## Instructions

### Section 1: clinical_insights
Use the TRANSCRIPT below to generate:
- "summary": A concise 2-3 sentence narrative that synthesizes what happened during the consultation.
- "key_observations": Extract the most clinically relevant observations from the conversation (symptoms reported, examination findings, medication changes, patient concerns).
- "red_flags": Identify any immediate safety concerns or warning signs mentioned. If none exist, return an empty array.

### Section 2: patient_instructions
Use the TRANSCRIPT below to generate:
- "lifestyle_and_diet": Specific lifestyle and dietary recommendations discussed or implied during the consultation.
- "care_plan_steps": Actionable care plan steps the patient should follow (monitoring, medication changes, follow-up scheduling).

### Section 3: clinical_audit
Use both the TRANSCRIPT and the APPOINTMENT NOTE FORM below to generate:
- "form_discrepancies": Compare what was verbally discussed in the transcript with what is recorded in the structured form. Flag any medications, complaints, or findings mentioned verbally but missing from the form (or vice versa). If the form is empty/unavailable, note that.
- "patient_comprehension_rating": Rate the patient's apparent understanding as "High", "Medium", or "Low" based on their responses, questions asked, and engagement level. Include a brief justification in parentheses.

## Rules
- Every field must be present in the output.
- If a field has no applicable data, use an empty string for string fields or an empty array for array fields.
- Follow the output schema exactly.
- Be concise and clinically accurate.
- Do not hallucinate information not present in the transcript.

---

## TRANSCRIPT:
{transcript}

---

## APPOINTMENT NOTE FORM:
{appointment_note}

---

Generate the structured report following the exact schema specified."""


def generate_report_from_llm(transcript: str, appointment_note_str: str) -> dict:
    """Generate a structured clinical report using Gemini 2.5 Flash.

    Args:
        transcript: The full consultation transcript text.
        appointment_note_str: Parsed appointment note form as a human-readable string.

    Returns:
        A dict matching the REPORT_SCHEMA structure.
    """
    prompt = REPORT_PROMPT_TEMPLATE.format(
        transcript=transcript,
        appointment_note=appointment_note_str,
    )

    try:
        response = _client.models.generate_content(
            model=REPORT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=REPORT_SCHEMA,
                temperature=0.2,
            ),
        )

        # Parse the JSON response
        result = json.loads(response.text)
        print(f"[InferenceService] Report generated successfully via {REPORT_MODEL}")
        return result

    except Exception as e:
        print(f"[InferenceService] ERROR generating report: {e}")
        # Return a valid empty report matching the schema on failure
        return {
            "clinical_insights": {
                "summary": "",
                "key_observations": [],
                "red_flags": [],
            },
            "patient_instructions": {
                "lifestyle_and_diet": [],
                "care_plan_steps": [],
            },
            "clinical_audit": {
                "form_discrepancies": [f"Report generation failed: {str(e)}"],
                "patient_comprehension_rating": "",
            },
        }
