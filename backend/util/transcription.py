"""Google Cloud Speech-to-Text V2 transcription utility."""

import os

from google.cloud.speech_v2 import SpeechClient
from google.cloud.speech_v2.types import cloud_speech


GOOGLE_CLOUD_PROJECT = os.environ.get("GOOGLE_CLOUD_PROJECT", "")


def transcribe_audio(gcs_uri: str) -> str:
    """Transcribe a merged audio file from GCS using BatchRecognize with Dynamic Batching.

    Uses the 'long' model in global location — designed for long-form audio,
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
    # The results dict is keyed by the GCS URI, but the key may not match exactly
    # (different normalization). Iterate all results to be safe.
    transcript_parts = []

    print(f"[Transcription] Response results keys: {list(response.results.keys())}")
    print(f"[Transcription] Expected key: {gcs_uri}")

    for file_uri, file_result in response.results.items():
        print(f"[Transcription] Processing file: {file_uri}")

        # Check if inline_result is available
        if file_result.transcript and file_result.transcript.results:
            for result in file_result.transcript.results:
                if result.alternatives:
                    transcript_parts.append(result.alternatives[0].transcript)
        elif file_result.cloud_storage_result:
            print(f"[Transcription] Result stored in GCS: {file_result.cloud_storage_result.uri}")
        else:
            print(f"[Transcription] No transcript or cloud_storage_result for {file_uri}")
            print(f"[Transcription] file_result fields: {file_result}")

    full_transcript = " ".join(transcript_parts)
    print(f"[Transcription] Final transcript length: {len(full_transcript)} chars")
    print(f"[Transcription] : {full_transcript}")
    return full_transcript
