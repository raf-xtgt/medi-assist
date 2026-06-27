#!/usr/bin/env python3
"""One-time script to make the GCS bucket publicly readable.

Grants allUsers the roles/storage.objectViewer IAM role on the bucket,
making all objects accessible via https://storage.googleapis.com/<bucket>/<path>.

This is safe to run multiple times — GCS deduplicates IAM bindings.

Usage:
    cd backend
    source .webservice-venv/bin/activate
    python scripts/make_bucket_public.py

Alternatively via gcloud CLI:
    gcloud storage buckets add-iam-policy-binding gs://medi-assist-recordings \
        --member=allUsers \
        --role=roles/storage.objectViewer

Reference: https://cloud.google.com/storage/docs/access-control/making-data-public
"""

import sys
import os

# Add backend root to path so we can import util
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from util.gcs import make_bucket_public, GCS_BUCKET_NAME


def main():
    print(f"Making bucket '{GCS_BUCKET_NAME}' publicly readable...")
    print("This grants allUsers the roles/storage.objectViewer IAM role.")
    print()

    make_bucket_public()

    print()
    print("Done! All objects in the bucket are now publicly accessible at:")
    print(f"  https://storage.googleapis.com/{GCS_BUCKET_NAME}/<blob_path>")
    print()
    print("To verify, try opening an existing object URL in an incognito browser window.")


if __name__ == "__main__":
    main()
