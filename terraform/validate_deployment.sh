#!/usr/bin/env bash
# ==============================================================================
# MediMind — Full Automated Docker Build, ECR Push & Terraform Deployment (Bash)
# ==============================================================================

set -e

# Disable interactive AWS CLI pager (-- More --) completely
export AWS_PAGER=""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==================================================================${NC}"
echo -e "${CYAN}      MediMind Automated AWS Infrastructure Build & Deploy        ${NC}"
echo -e "${CYAN}==================================================================${NC}\n"

# Step 0: AWS CLI Identity Check
echo -e "${YELLOW}[Step 0/5] Checking AWS CLI authentication...${NC}"
if aws sts get-caller-identity --no-cli-pager >/dev/null 2>&1; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text --no-cli-pager)
    AWS_REGION="us-east-1"
    ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    CALLER_ARN=$(aws sts get-caller-identity --query "Arn" --output text --no-cli-pager)
    echo -e "  ${GREEN}[OK] AWS CLI Authenticated!${NC}"
    echo -e "       Account ID:   ${ACCOUNT_ID}"
    echo -e "       User/Role:    ${CALLER_ARN}"
    echo -e "       ECR Registry: ${ECR_REGISTRY}\n"
else
    echo -e "  ${RED}[FAIL] AWS CLI credentials not found. Please run 'aws configure'.${NC}"
    exit 1
fi

# Step 1: Initialize Terraform & Apply Infrastructure FIRST (provisions ECR repositories)
echo -e "${YELLOW}[Step 1/5] Initializing Remote S3 State Backend & Applying Terraform Infrastructure...${NC}"
STATE_BUCKET="medtrack-development-tfstate-${ACCOUNT_ID}"

echo -e "  Verifying if Remote S3 State Backend '${STATE_BUCKET}' exists..."
if aws s3api head-bucket --bucket "$STATE_BUCKET" --no-cli-pager 2>/dev/null; then
    echo -e "  ${GREEN}[OK] S3 State Bucket '${STATE_BUCKET}' already exists and is accessible.${NC}"
else
    echo -e "  S3 State Bucket '${STATE_BUCKET}' does not exist. Creating bucket in region '${AWS_REGION}'..."
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$STATE_BUCKET" --region "$AWS_REGION" --no-cli-pager >/dev/null
    else
        aws s3api create-bucket --bucket "$STATE_BUCKET" --region "$AWS_REGION" --create-bucket-configuration LocationConstraint="$AWS_REGION" --no-cli-pager >/dev/null
    fi
    aws s3api put-bucket-versioning --bucket "$STATE_BUCKET" --versioning-configuration Status=Enabled --no-cli-pager >/dev/null
    aws s3api put-bucket-encryption --bucket "$STATE_BUCKET" --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' --no-cli-pager >/dev/null
    aws s3api put-public-access-block --bucket "$STATE_BUCKET" --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" --no-cli-pager >/dev/null
    echo -e "  ${GREEN}[OK] Created S3 State Bucket '${STATE_BUCKET}'!${NC}"
fi

echo -e "  Initializing Terraform backend state..."
terraform init -reconfigure -backend-config="bucket=${STATE_BUCKET}" -backend-config="region=${AWS_REGION}"
echo -e "  Running 'terraform apply -auto-approve' to provision ECR Repositories & Cloud Infra..."
terraform apply -auto-approve
echo -e "  ${GREEN}[OK] ECR Repositories & Cloud Infrastructure Provisioned!${NC}\n"

# Step 2: Authenticate Docker with AWS ECR & Build/Push Container Images
echo -e "${YELLOW}[Step 2/5] Authenticating Docker & Pushing Container Images...${NC}"
aws ecr get-login-password --region "$AWS_REGION" --no-cli-pager | docker login --username AWS --password-stdin "$ECR_REGISTRY"

IMAGE_TAG=$(git rev-parse --short HEAD 2>/dev/null || date +%s)
echo -e "  Generated build image tag: ${CYAN}${IMAGE_TAG}${NC}"

echo -e "  ---> Building [backend] container..."
docker build -t medtrack-backend:latest -t medtrack-backend:${IMAGE_TAG} ../backend
docker tag medtrack-backend:latest "${ECR_REGISTRY}/medtrack-backend:latest"
docker tag medtrack-backend:${IMAGE_TAG} "${ECR_REGISTRY}/medtrack-backend:${IMAGE_TAG}"
echo -e "  ---> Pushing [backend] (latest & ${IMAGE_TAG}) to AWS ECR..."
docker push "${ECR_REGISTRY}/medtrack-backend:latest"
docker push "${ECR_REGISTRY}/medtrack-backend:${IMAGE_TAG}"
echo -e "  ${GREEN}[OK] Backend image updated and pushed successfully!${NC}\n"

echo -e "  ---> Building [frontend] container..."
docker build --build-arg NEXT_PUBLIC_API_URL="/api/v1" -t medtrack-frontend:latest -t medtrack-frontend:${IMAGE_TAG} ../frontend
docker tag medtrack-frontend:latest "${ECR_REGISTRY}/medtrack-frontend:latest"
docker tag medtrack-frontend:${IMAGE_TAG} "${ECR_REGISTRY}/medtrack-frontend:${IMAGE_TAG}"
echo -e "  ---> Pushing [frontend] (latest & ${IMAGE_TAG}) to AWS ECR..."
docker push "${ECR_REGISTRY}/medtrack-frontend:latest"
docker push "${ECR_REGISTRY}/medtrack-frontend:${IMAGE_TAG}"
echo -e "  ${GREEN}[OK] Frontend image updated and pushed successfully!${NC}\n"

echo -e "  ---> Building [worker] container..."
docker build -t medtrack-worker:latest -t medtrack-worker:${IMAGE_TAG} ../worker
docker tag medtrack-worker:latest "${ECR_REGISTRY}/medtrack-worker:latest"
docker tag medtrack-worker:${IMAGE_TAG} "${ECR_REGISTRY}/medtrack-worker:${IMAGE_TAG}"
echo -e "  ---> Pushing [worker] (latest & ${IMAGE_TAG}) to AWS ECR..."
docker push "${ECR_REGISTRY}/medtrack-worker:latest"
docker push "${ECR_REGISTRY}/medtrack-worker:${IMAGE_TAG}"
echo -e "  ${GREEN}[OK] Worker image updated and pushed successfully!${NC}\n"

# Step 3: Trigger ECS Forced Rolling Redeployment
echo -e "${YELLOW}[Step 3/5] Triggering ECS Forced Rolling Redeployment...${NC}"
aws ecs update-service --cluster medtrack-development-cluster --service medtrack-development-frontend-service --force-new-deployment --no-cli-pager >/dev/null
aws ecs update-service --cluster medtrack-development-cluster --service medtrack-development-backend-service --force-new-deployment --no-cli-pager >/dev/null
aws ecs update-service --cluster medtrack-development-cluster --service medtrack-development-worker-service --force-new-deployment --no-cli-pager >/dev/null
echo -e "  ${GREEN}[OK] Forced new deployment triggered across all services! ECS will pull the newly updated container images.${NC}\n"

# Step 4: Outputs & Target Health Audit
echo -e "${YELLOW}[Step 4/5] Auditing Target Groups & Secrets Manager...${NC}"
ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null || echo "")
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name 2>/dev/null || echo "")
SECRETS_ARN=$(terraform output -raw secrets_manager_arn 2>/dev/null || echo "")

echo -e "  ALB Hostname:        ${ALB_DNS}"
echo -e "  ECS Cluster:         ${CLUSTER_NAME}"
echo -e "  Secrets Manager ARN: ${SECRETS_ARN}\n"

FRONTEND_TG=$(terraform output -raw frontend_target_group_arn 2>/dev/null || echo "")
BACKEND_TG=$(terraform output -raw backend_target_group_arn 2>/dev/null || echo "")
WORKER_TG=$(terraform output -raw worker_target_group_arn 2>/dev/null || echo "")

check_tg() {
    local tg=$1
    local name=$2
    if [ -n "$tg" ]; then
        echo -e "  Inspecting ${name}..."
        aws elbv2 describe-target-health --target-group-arn "$tg" --query "TargetHealthDescriptions[*].[Target.Id,TargetHealth.State,TargetHealth.Reason]" --output table --no-cli-pager || true
    fi
}

check_tg "$FRONTEND_TG" "Frontend Service"
check_tg "$BACKEND_TG" "Backend Express API Service"
check_tg "$WORKER_TG" "Worker Service"
echo ""

# Step 5: HTTP Pings
echo -e "${YELLOW}[Step 5/5] Testing Application HTTP Endpoints...${NC}"

ping_route() {
    local url=$1
    local label=$2
    echo -n "  Testing [${label}] -> ${url} ... "
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")
    if [[ "$code" =~ ^(200|201|204|301|302)$ ]]; then
        echo -e "${GREEN}[HEALTHY HTTP ${code}]${NC}"
    else
        echo -e "${YELLOW}[HTTP ${code}]${NC}"
    fi
}

if [ -n "$ALB_DNS" ]; then
    ping_route "http://${ALB_DNS}/" "Frontend Root (/*)"
    ping_route "http://${ALB_DNS}/api/v1/health" "Backend Express API (/api/*)"
    ping_route "http://${ALB_DNS}/worker/health" "Worker Service (/worker/*)"
fi

echo -e "\n${CYAN}==================================================================${NC}"
echo -e "${CYAN}    Deployment & Remote State Sync Complete! State updated.       ${NC}"
echo -e "${CYAN}==================================================================${NC}"
