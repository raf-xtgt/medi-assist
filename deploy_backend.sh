#!/bin/bash
set -e

# Configuration
REGION="us-east-1"
SERVICE_NAME="medi-assist-backend"
ECR_REPO_NAME="medi-assist-backend"
ROLE_NAME="AppRunnerECRAccessRole"

echo "=== 1. Checking AWS Account and Region ==="
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"
echo "AWS Region: $REGION"

# Create ECR repository if not exists
echo "=== 2. Setting up ECR Repository ==="
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $REGION >/dev/null 2>&1 || \
aws ecr create-repository --repository-name $ECR_REPO_NAME --region $REGION

# Docker build and push
echo "=== 3. Building and Pushing Docker Image ==="
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

docker build -t $ECR_REPO_NAME ./backend

IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO_NAME:latest"
docker tag $ECR_REPO_NAME:latest $IMAGE_URI
docker push $IMAGE_URI

# Ensure AppRunnerECRAccessRole exists
echo "=== 4. Setting up App Runner ECR Access IAM Role ==="
ROLE_ARN=""
if aws iam get-role --role-name $ROLE_NAME >/dev/null 2>&1; then
    echo "IAM Role $ROLE_NAME already exists."
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query "Role.Arn" --output text)
else
    echo "Creating IAM Role $ROLE_NAME..."
    cat <<EOF > trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "build.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
    ROLE_ARN=$(aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json --query "Role.Arn" --output text)
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
    rm trust-policy.json
    # Give AWS some time to propagate IAM role creation
    echo "Waiting 10 seconds for IAM role propagation..."
    sleep 10
fi
echo "Role ARN: $ROLE_ARN"

# Generate Environment Variables JSON for App Runner
echo "=== 5. Preparing Environment Variables ==="
# Load env variables from backend/.env, skip commented out lines and empty lines, and format as JSON
ENV_VARS_JSON="{}"

# Add GCP creds base64 encoded
if [ -f "backend/creds.json" ]; then
    GCP_CREDS_BASE64=$(cat backend/creds.json | base64 | tr -d '\n')
    # Use python to construct/append JSON to avoid escaping hell in bash
    ENV_VARS_JSON=$(python3 -c "
import json
vars = {}
# Add GCP Creds
vars['GCP_CREDS_JSON_BASE64'] = '$GCP_CREDS_BASE64'
# Read .env file
with open('backend/.env', 'r') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        if '=' in line:
            k, v = line.split('=', 1)
            # Remove optional quotes
            v = v.strip('\"').strip('\'')
            # Override local paths
            if k == 'GOOGLE_APPLICATION_CREDENTIALS':
                v = '/app/creds.json'
            vars[k] = v
print(json.dumps(vars))
")
else
    echo "ERROR: backend/creds.json not found!"
    exit 1
fi

# Determine if service exists
echo "=== 6. Deploying to AWS App Runner ==="
SERVICE_ARN=$(aws apprunner list-services --region $REGION --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text)

# Write the ImageRepository config to a temp file
cat <<EOF > image-repo-config.json
{
  "ImageRepository": {
    "ImageIdentifier": "$IMAGE_URI",
    "ImageConfiguration": {
      "Port": "8000",
      "RuntimeEnvironmentVariables": $ENV_VARS_JSON
    },
    "ImageRepositoryType": "ECR"
  },
  "AuthenticationConfiguration": {
    "AccessRoleArn": "$ROLE_ARN"
  }
}
EOF

if [ -n "$SERVICE_ARN" ]; then
    echo "Updating existing App Runner service: $SERVICE_NAME"
    aws apprunner update-service \
        --region $REGION \
        --service-arn "$SERVICE_ARN" \
        --source-configuration file://image-repo-config.json > /dev/null
    
    echo "Update triggered successfully. Service is redeploying."
    # Retrieve URL
    SERVICE_URL=$(aws apprunner describe-service --region $REGION --service-arn "$SERVICE_ARN" --query "Service.ServiceUrl" --output text)
    echo "Backend will be available at: https://$SERVICE_URL"
else
    echo "Creating new App Runner service: $SERVICE_NAME"
    SERVICE_INFO=$(aws apprunner create-service \
        --region $REGION \
        --service-name "$SERVICE_NAME" \
        --source-configuration file://image-repo-config.json \
        --query "Service.{ServiceArn:ServiceArn,ServiceUrl:ServiceUrl}" \
        --output json)
    
    SERVICE_ARN=$(echo "$SERVICE_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin)['ServiceArn'])")
    SERVICE_URL=$(echo "$SERVICE_INFO" | python3 -c "import sys, json; print(json.load(sys.stdin)['ServiceUrl'])")
    echo "Service URL: https://$SERVICE_URL"
fi

rm image-repo-config.json

# Wait and output status
echo "=== 7. Service Deployment Status ==="
echo "AWS App Runner Service ARN: $SERVICE_ARN"
echo "You can check the deployment progress in the AWS App Runner console or by running:"
echo "  aws apprunner list-operations --service-arn $SERVICE_ARN --region $REGION"
echo "Once the status becomes 'Running', your backend is live!"
