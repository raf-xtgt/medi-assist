"""Amazon Bedrock client configuration.

Provides a reusable boto3 bedrock-runtime client for LLM inferencing.
Credentials are read automatically from environment variables:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_DEFAULT_REGION
"""

import os

import boto3
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv()

BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "us.amazon.nova-2-lite-v1:0")
AWS_REGION = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")

_bedrock_config = Config(
    region_name=AWS_REGION,
    read_timeout=120,
    connect_timeout=10,
    retries={"max_attempts": 2},
)

bedrock_runtime = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION,
    config=_bedrock_config,
)
