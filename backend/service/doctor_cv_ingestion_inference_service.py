"""Service for extracting doctor profile details from a CV PDF using Gemini 2.5 Flash.

Uses the google-genai SDK with Vertex AI backend to process PDF documents
and extract structured information matching the DoctorCVExtraction schema.
"""

import json

from dotenv import load_dotenv
from google import genai
from google.genai import types

from model.dto.doctor_cv_ingestion_dto import DoctorCVExtraction

load_dotenv()

# Reuse the same client pattern as app_mda_inference_service
_client = genai.Client()

CV_MODEL = "gemini-2.5-flash"

# Output schema for structured extraction
CV_EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {
            "type": "string",
            "description": "The doctor's full name."
        },
        "specialty": {
            "type": "string",
            "description": "A comma-separated string or concise list identifying the doctor's primary medical specialties or clinical focuses."
        },
        "about": {
            "type": "string",
            "description": "A clean, professionally written biography summary synthesized from their career background, statement, and experience."
        }
    },
    "required": ["name", "specialty", "about"]
}

CV_EXTRACTION_PROMPT = """You are a medical HR assistant. Your task is to extract structured professional information from a doctor's CV/resume PDF.

## Instructions
- Extract the doctor's full name exactly as it appears in the document.
- Identify their primary medical specialties or clinical focuses. Provide as a comma-separated string (e.g., "Cardiology, Interventional Cardiology, Heart Failure").
- Write a clean, professional biography summary (2-4 sentences) synthesized from their career background, education, achievements, and clinical experience. Do NOT copy text verbatim — rephrase into a cohesive bio suitable for a patient-facing doctor profile.

## Rules
- All fields must be populated. If a field cannot be determined, use "Unknown" for name/specialty or "No biography available." for about.
- Be concise and clinically accurate.
- Do not include personal contact information in the biography.

Extract the information from the attached CV document."""


def extract_doctor_cv(pdf_bytes: bytes) -> DoctorCVExtraction:
    """Extract doctor profile details from a CV PDF using Gemini 2.5 Flash.

    Args:
        pdf_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        A DoctorCVExtraction model with name, specialty, and about fields.
    """
    try:
        response = _client.models.generate_content(
            model=CV_MODEL,
            contents=[
                types.Part.from_bytes(
                    data=pdf_bytes,
                    mime_type="application/pdf",
                ),
                CV_EXTRACTION_PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CV_EXTRACTION_SCHEMA,
                temperature=0.1,
            ),
        )

        result = json.loads(response.text)
        print(f"[DoctorCVIngestion] CV extraction successful via {CV_MODEL}")
        return DoctorCVExtraction(**result)

    except Exception as e:
        print(f"[DoctorCVIngestion] ERROR extracting CV: {e}")
        raise ValueError(f"Failed to extract CV data: {str(e)}") from e
