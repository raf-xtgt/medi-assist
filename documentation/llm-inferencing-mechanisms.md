# LLM Inferencing Mechanisms

This document details all AI/ML inferencing capabilities in the Medi-Assist backend.

---

## 1. Speech-to-Text (STT) — Audio Transcription

**File:** `backend/util/transcription.py`
**Service:** Google Cloud Speech-to-Text V2 (BatchRecognize API)

### How It Works

After a doctor ends an appointment recording, audio chunks stored in GCS are composed into a single `merged_audio.webm` file. The `transcribe_audio()` function sends this to Google's batch transcription service.

### Technical Details

| Parameter | Value |
|-----------|-------|
| API | `google.cloud.speech_v2.SpeechClient.batch_recognize()` |
| Model | `long` (global location — optimized for long-form audio) |
| Language | `en-US` |
| Features | Automatic punctuation enabled |
| Processing | `DYNAMIC_BATCHING` (cost-optimized at $0.003/min) |
| Timeout | 600 seconds (10 minutes) |
| Input | `gs://` URI of merged audio in GCS |
| Output | Inline response (full transcript as string) |
| Decoding | `AutoDetectDecodingConfig` (handles webm/opus automatically) |

### Authentication

Uses `GOOGLE_APPLICATION_CREDENTIALS` (service account JSON) pointed at by the `creds.json` file in the backend directory. Requires the `GOOGLE_CLOUD_PROJECT` env var for the recognizer path.

### Current Status

**Not wired into the live pipeline** — the background pipeline currently uses a dummy transcript from `util/dummy_agents.py:generate_transcript()`. Ready to swap in by replacing that call with `transcribe_audio(merged_uri)`.

---

## 2. Clinical Report Generation

**File:** `backend/service/app_mda_inference_service.py` → `generate_report_from_llm()`
**Model:** Gemini 2.5 Flash via Google Vertex AI

### How It Works

After the transcript is generated (Step 1 of the pipeline), the system fetches the appointment note form (vitals, chief complaint, prescriptions typed by the doctor) and sends both to Gemini. The LLM produces a structured JSON report.

### Technical Details

| Parameter | Value |
|-----------|-------|
| SDK | `google.genai.Client()` (Vertex AI backend) |
| Model | `gemini-2.5-flash` |
| Temperature | `0.2` (deterministic clinical output) |
| Response format | `application/json` with enforced `response_schema` |
| Input | Transcript text + parsed appointment note string |

### Output Schema (Enforced)

```json
{
  "clinical_insights": {
    "summary": "2-3 sentence narrative of the consultation",
    "key_observations": ["array of clinically relevant observations"],
    "red_flags": ["safety concerns or warnings; empty if none"]
  },
  "patient_instructions": {
    "lifestyle_and_diet": ["dietary/lifestyle recommendations"],
    "care_plan_steps": ["actionable care plan steps"]
  },
  "clinical_audit": {
    "form_discrepancies": ["differences between transcript and typed form"],
    "patient_comprehension_rating": "High/Medium/Low with justification"
  }
}
```

### Pipeline Integration

Called by `util/dummy_agents.py:generate_report()` → `service/app_mda_inference_service.py:generate_report_from_llm()`. The output is stored in `app_mda_appointment_session.transcript_metadata` (JSON column) and pushed to the frontend via SSE (`report_generated` event).

### Error Handling

On failure, returns a valid empty report matching the schema with the error message in `form_discrepancies`. The pipeline does not crash — it marks the step complete and continues.

---

## 3. Follow-Up Message Generation

**File:** `backend/service/app_mda_inference_service.py` → `generate_followup_from_llm()`
**Model:** Gemini 2.5 Flash via Google Vertex AI

### How It Works

After the clinical report is generated (Step 2), the report is parsed into a human-readable summary string and sent to Gemini to produce a concise patient follow-up message.

### Technical Details

| Parameter | Value |
|-----------|-------|
| SDK | `google.genai.Client()` (Vertex AI backend) |
| Model | `gemini-2.5-flash` |
| Temperature | `0.3` |
| Response format | Plain text (no structured schema) |
| Input | Parsed report summary string |

### Prompt Constraints

- Message body must be AT MOST 30 words (excluding greeting/sign-off)
- No icons, emojis, or special characters
- Warm, professional tone
- Includes the most important action item from the visit
- Format: Greeting → body → sign-off

### Pipeline Integration

Called by `util/dummy_agents.py:generate_follow_up_message()` → `service/app_mda_inference_service.py:generate_followup_from_llm()`. The output is stored in `app_mda_follow_up_queue.follow_up_msg` and pushed to the frontend via SSE (`followup_queued` event).

### Error Handling

On failure, returns a generic fallback message: "Thank you for your visit today. Please follow the care plan discussed with your doctor."

---

## 4. Doctor CV Ingestion (Profile Extraction)

**File:** `backend/service/doctor_cv_ingestion_inference_service.py` → `extract_doctor_cv()`
**Model:** Gemini 2.5 Flash via Google Vertex AI (Multimodal — PDF input)

### How It Works

When an admin uploads a doctor's CV/resume PDF, the file bytes are sent directly to Gemini's multimodal input. The LLM reads the PDF and extracts structured profile data.

### Technical Details

| Parameter | Value |
|-----------|-------|
| SDK | `google.genai.Client()` (Vertex AI backend) |
| Model | `gemini-2.5-flash` |
| Temperature | `0.1` (highly deterministic extraction) |
| Response format | `application/json` with enforced `response_schema` |
| Input | Raw PDF bytes (`types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")`) |

### Output Schema (Enforced)

```json
{
  "name": "Doctor's full name",
  "specialty": "Comma-separated specialties (e.g., 'Cardiology, Heart Failure')",
  "about": "Professional biography summary (2-4 sentences)"
}
```

### Prompt Rules

- Extract name exactly as it appears in the document
- Synthesize (not copy) a professional biography from career background
- Exclude personal contact information from the bio
- Use "Unknown" / "No biography available." as fallback values

### Error Handling

Raises `ValueError` on failure — the calling controller should catch and return a 500 with details.

---

## 5. Test Inferencing Endpoints

**File:** `backend/controller/app_mda_inferencing_controller.py`
**Mount:** `/api/agent/inferencing/`

Two test endpoints for verifying LLM connectivity during development:

### 5a. Amazon Bedrock — Nova 2 Lite

| Endpoint | `POST /api/agent/inferencing/invoke` |
|----------|--------------------------------------|
| **Client** | `boto3.client("bedrock-runtime")` via `util/bedrock_client.py` |
| **Model** | `us.amazon.nova-2-lite-v1:0` (configurable via `BEDROCK_MODEL_ID` env) |
| **API** | Bedrock Converse API |
| **Config** | maxTokens: 1024, temperature: 0.7, topP: 0.9 |
| **Timeout** | read: 120s, connect: 10s, retries: 2 |
| **Auth** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION` |

### 5b. Google Vertex AI — Gemini 2.5 Flash

| Endpoint | `POST /api/agent/inferencing/invoke-gemini` |
|----------|---------------------------------------------|
| **Client** | `google.genai.Client(vertexai=True)` via `util/gemini_client.py` |
| **Model** | `gemini-2.5-flash` |
| **Config** | temperature: 0.7, max_output_tokens: 1024, top_p: 0.9 |
| **Auth** | `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION` |

### Request/Response Schema

```json
// Request
{ "prompt": "Your test prompt here" }

// Response
{
  "model_id": "gemini-2.5-flash",
  "response_text": "LLM output...",
  "usage": {
    "inputTokens": 42,
    "outputTokens": 128,
    "totalTokens": 170
  }
}
```

---

## Client Configuration Summary

| Client | File | SDK | Auth |
|--------|------|-----|------|
| Gemini (shared) | `util/gemini_client.py` | `google.genai.Client(vertexai=True)` | GOOGLE_APPLICATION_CREDENTIALS + project/location |
| Gemini (inference service) | `service/app_mda_inference_service.py` | `google.genai.Client()` (uses GOOGLE_GENAI_USE_VERTEXAI=TRUE env) | Same as above |
| Gemini (CV ingestion) | `service/doctor_cv_ingestion_inference_service.py` | `google.genai.Client()` | Same as above |
| Bedrock | `util/bedrock_client.py` | `boto3.client("bedrock-runtime")` | AWS_ACCESS_KEY_ID + SECRET + REGION |
| Speech-to-Text | `util/transcription.py` | `google.cloud.speech_v2.SpeechClient()` | GOOGLE_APPLICATION_CREDENTIALS |

---

## Environment Variables Required

```env
# Google Cloud (all LLM + STT services)
GOOGLE_APPLICATION_CREDENTIALS=creds.json
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=TRUE

# AWS Bedrock (test inferencing only)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
BEDROCK_MODEL_ID=us.amazon.nova-2-lite-v1:0

# GCS (audio storage for STT)
GCS_BUCKET_NAME=medi-assist-recordings
```
