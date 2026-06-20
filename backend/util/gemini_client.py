"""Google Vertex AI Gemini client configuration.

Provides a reusable google-genai client for LLM inferencing via Vertex AI.
Credentials are read automatically from environment variables:
  - GOOGLE_CLOUD_PROJECT
  - GOOGLE_CLOUD_LOCATION
  - GOOGLE_GENAI_USE_VERTEXAI
  - GOOGLE_APPLICATION_CREDENTIALS
"""

import os

from google import genai
from dotenv import load_dotenv

load_dotenv()

GOOGLE_CLOUD_PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "")
GOOGLE_CLOUD_LOCATION = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
GEMINI_MODEL_ID = "gemini-2.5-flash"

gemini_client = genai.Client(
    vertexai=True,
    project=GOOGLE_CLOUD_PROJECT,
    location=GOOGLE_CLOUD_LOCATION,
)
