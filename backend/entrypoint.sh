#!/bin/sh
set -e

# Decode GCP service account json if passed via environment variable
if [ -n "$GCP_CREDS_JSON_BASE64" ]; then
    echo "[Entrypoint] Decoding GCP credentials from base64 env..."
    echo "$GCP_CREDS_JSON_BASE64" | base64 -d > /app/creds.json
    export GOOGLE_APPLICATION_CREDENTIALS="/app/creds.json"
    echo "[Entrypoint] GCP credentials successfully written to /app/creds.json"
else
    echo "[Entrypoint] Warning: GCP_CREDS_JSON_BASE64 not set, falling back to local credentials file if it exists"
fi

# Execute the FastAPI application with uvicorn
echo "[Entrypoint] Starting FastAPI server on port 8000..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
