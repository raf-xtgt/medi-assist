"""Google Cloud Speech-to-Text V2 transcription utility."""

import os

from google.cloud.speech_v2 import SpeechClient
from google.cloud.speech_v2.types import cloud_speech


GOOGLE_CLOUD_PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "")


def transcribe_audio(gcs_uri: str) -> str:
    """Transcribe a merged audio file from GCS using BatchRecognize with Dynamic Batching.

    Uses the 'latest_long' model in global location — designed for long-form audio,
    available everywhere, and eligible for dynamic batch pricing ($0.003/min).

    Args:
        gcs_uri: The gs:// URI of the merged audio file in GCS.

    Returns:
        The full transcript text as a single string.
    """
    client = SpeechClient()

    config = cloud_speech.RecognitionConfig(
        auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(),
        language_codes=["en-US"],
        model="long",
        features=cloud_speech.RecognitionFeatures(
            enable_automatic_punctuation=True,
        ),
    )

    file_metadata = cloud_speech.BatchRecognizeFileMetadata(uri=gcs_uri)

    request = cloud_speech.BatchRecognizeRequest(
        recognizer=f"projects/{GOOGLE_CLOUD_PROJECT}/locations/global/recognizers/_",
        config=config,
        files=[file_metadata],
        recognition_output_config=cloud_speech.RecognitionOutputConfig(
            inline_response_config=cloud_speech.InlineOutputConfig(),
        ),
        processing_strategy=cloud_speech.BatchRecognizeRequest.ProcessingStrategy.DYNAMIC_BATCHING,
    )

    # This is a long-running operation — will block until complete
    operation = client.batch_recognize(request=request)
    response = operation.result(timeout=600)  # 10 min timeout for long audio

    # Extract transcript text from response
    transcript_parts = []
    if gcs_uri in response.results:
        for result in response.results[gcs_uri].transcript.results:
            if result.alternatives:
                transcript_parts.append(result.alternatives[0].transcript)

    return " ".join(transcript_parts)
