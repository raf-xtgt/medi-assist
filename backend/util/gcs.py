"""Google Cloud Storage utility for audio chunk management."""

import os
from google.cloud import storage

# GCS bucket name — create this bucket in your GCP project
GCS_BUCKET_NAME = os.environ.get("GCS_BUCKET_NAME", "medi-assist-recordings")


def get_gcs_client() -> storage.Client:
    """Return an authenticated GCS client using application credentials."""
    return storage.Client()


def get_bucket():
    """Return the GCS bucket for audio recordings."""
    client = get_gcs_client()
    return client.bucket(GCS_BUCKET_NAME)


def upload_chunk(
    session_guid: str,
    clinic_guid: str,
    doctor_guid: str,
    appointment_guid: str,
    chunk_index: int,
    file_data: bytes,
    content_type: str = "audio/webm",
) -> str:
    """Upload an audio chunk to GCS and return the gs:// URI."""
    bucket = get_bucket()
    blob_path = (
        f"{clinic_guid}/{doctor_guid}/{appointment_guid}/"
        f"{session_guid}/chunk_{chunk_index:04d}.webm"
    )
    blob = bucket.blob(blob_path)
    blob.upload_from_string(file_data, content_type=content_type)
    return f"gs://{GCS_BUCKET_NAME}/{blob_path}"


def list_chunks(
    session_guid: str,
    clinic_guid: str,
    doctor_guid: str,
    appointment_guid: str,
) -> list[str]:
    """List all chunk blob names for a session, sorted by name."""
    bucket = get_bucket()
    prefix = (
        f"{clinic_guid}/{doctor_guid}/{appointment_guid}/{session_guid}/"
    )
    blobs = list(bucket.list_blobs(prefix=prefix))
    # Filter only chunk files and sort
    chunk_blobs = sorted(
        [b for b in blobs if b.name.endswith(".webm") and "chunk_" in b.name],
        key=lambda b: b.name,
    )
    return [b.name for b in chunk_blobs]


def compose_chunks(
    session_guid: str,
    clinic_guid: str,
    doctor_guid: str,
    appointment_guid: str,
) -> str:
    """Compose all chunks into a single merged audio file in GCS.

    Uses GCS server-side compose (max 32 per call, so we do it in rounds).
    Returns the gs:// URI of the merged file.
    """
    bucket = get_bucket()
    prefix = (
        f"{clinic_guid}/{doctor_guid}/{appointment_guid}/{session_guid}/"
    )

    # List and sort chunk blobs
    blobs = list(bucket.list_blobs(prefix=prefix))
    chunk_blobs = sorted(
        [b for b in blobs if "chunk_" in b.name and b.name.endswith(".webm")],
        key=lambda b: b.name,
    )

    if not chunk_blobs:
        raise ValueError("No chunks found for session")

    if len(chunk_blobs) == 1:
        # Only one chunk, just return it as the merged file
        merged_path = f"{prefix}merged_audio.webm"
        bucket.copy_blob(chunk_blobs[0], bucket, merged_path)
        return f"gs://{GCS_BUCKET_NAME}/{merged_path}"

    # Compose in rounds of 32 (GCS compose limit)
    round_num = 0
    current_blobs = chunk_blobs

    while len(current_blobs) > 1:
        next_round = []
        for i in range(0, len(current_blobs), 32):
            batch = current_blobs[i : i + 32]
            if len(batch) == 1:
                next_round.append(batch[0])
                continue

            temp_name = f"{prefix}_temp_round{round_num}_batch{i // 32}.webm"
            dest_blob = bucket.blob(temp_name)
            dest_blob.compose(batch)
            next_round.append(dest_blob)

        current_blobs = next_round
        round_num += 1

    # Rename final composed blob to merged_audio.webm
    merged_path = f"{prefix}merged_audio.webm"
    final_blob = current_blobs[0]

    if final_blob.name != merged_path:
        bucket.copy_blob(final_blob, bucket, merged_path)
        final_blob.delete()

    # Clean up temp files
    temp_blobs = bucket.list_blobs(prefix=f"{prefix}_temp_")
    for tb in temp_blobs:
        tb.delete()

    return f"gs://{GCS_BUCKET_NAME}/{merged_path}"
