"""Controller for LLM inferencing endpoints.

Provides test endpoints to verify Bedrock Nova 2 Lite and Gemini Flash connectivity.
"""

from fastapi import APIRouter, HTTPException
from google.genai import types
from pydantic import BaseModel

from util.bedrock_client import bedrock_runtime, BEDROCK_MODEL_ID
from util.gemini_client import gemini_client, GEMINI_MODEL_ID

router = APIRouter(prefix="/inferencing", tags=["inferencing"])


class InferenceRequest(BaseModel):
    prompt: str


class InferenceResponse(BaseModel):
    model_id: str
    response_text: str
    usage: dict | None = None


@router.post("/invoke", response_model=InferenceResponse)
def invoke_llm(request: InferenceRequest):
    """Send a prompt to Nova 2 Lite via Bedrock Converse API and return the response."""
    try:
        response = bedrock_runtime.converse(
            modelId=BEDROCK_MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [{"text": request.prompt}],
                }
            ],
            inferenceConfig={
                "maxTokens": 1024,
                "temperature": 0.7,
                "topP": 0.9,
            },
        )

        # Extract the response text
        output_message = response["output"]["message"]
        response_text = output_message["content"][0]["text"]

        # Extract usage stats if available
        usage = response.get("usage")
        usage_dict = None
        if usage:
            usage_dict = {
                "inputTokens": usage.get("inputTokens"),
                "outputTokens": usage.get("outputTokens"),
                "totalTokens": usage.get("totalTokens"),
            }

        return InferenceResponse(
            model_id=BEDROCK_MODEL_ID,
            response_text=response_text,
            usage=usage_dict,
        )

    except bedrock_runtime.exceptions.AccessDeniedException as e:
        raise HTTPException(
            status_code=403,
            detail=f"Bedrock access denied. Check IAM permissions. Error: {str(e)}",
        )
    except bedrock_runtime.exceptions.ValidationException as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid request to Bedrock. Error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Bedrock inferencing failed: {str(e)}",
        )


@router.post("/invoke-gemini", response_model=InferenceResponse)
def invoke_gemini(request: InferenceRequest):
    """Send a prompt to Gemini 2.5 Flash via Vertex AI and return the response."""
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL_ID,
            contents=request.prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=1024,
                top_p=0.9,
            ),
        )

        response_text = response.text or ""

        # Extract usage stats if available
        usage_dict = None
        if response.usage_metadata:
            usage_dict = {
                "inputTokens": response.usage_metadata.prompt_token_count,
                "outputTokens": response.usage_metadata.candidates_token_count,
                "totalTokens": response.usage_metadata.total_token_count,
            }

        return InferenceResponse(
            model_id=GEMINI_MODEL_ID,
            response_text=response_text,
            usage=usage_dict,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini inferencing failed: {str(e)}",
        )
