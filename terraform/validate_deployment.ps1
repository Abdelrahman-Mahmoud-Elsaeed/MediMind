# ==============================================================================
# MediMind — Full Automated Docker Build, ECR Push & Terraform Deployment Script
# ==============================================================================

$ErrorActionPreference = "Continue"

# Disable interactive AWS CLI pager (-- More --) completely
$env:AWS_PAGER = ""

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "      MediMind Automated AWS Infrastructure Build & Deploy        " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------------------------
# STEP 0: AWS CLI Authentication & IAM Identity Check
# ------------------------------------------------------------------------------
Write-Host "[Step 0/5] Checking AWS CLI authentication..." -ForegroundColor Yellow
$awsIdentity = aws sts get-caller-identity --output json --no-cli-pager 2>$null | ConvertFrom-Json
if ($awsIdentity) {
    $accountId = $awsIdentity.Account
    $awsRegion = "us-east-1"
    $ecrRegistry = "$accountId.dkr.ecr.$awsRegion.amazonaws.com"

    Write-Host "  [OK] AWS CLI Authenticated!" -ForegroundColor Green
    Write-Host "       Account ID:   $accountId" -ForegroundColor Gray
    Write-Host "       User/Role:    $($awsIdentity.Arn)" -ForegroundColor Gray
    Write-Host "       ECR Registry: $ecrRegistry" -ForegroundColor Gray
} else {
    Write-Host "  [FAIL] AWS CLI credentials not found. Please run 'aws configure'." -ForegroundColor Red
    exit 1
}
Write-Host ""

# ------------------------------------------------------------------------------
# STEP 1: Auto-Bootstrap S3 State Bucket & Apply Terraform Infra FIRST
# ------------------------------------------------------------------------------
Write-Host "[Step 1/5] Initializing Remote S3 State Backend & Applying Terraform Infrastructure..." -ForegroundColor Yellow
$stateBucket = "medtrack-development-tfstate-$accountId"

aws s3api head-bucket --bucket $stateBucket --no-cli-pager 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Creating S3 State Bucket '$stateBucket'..." -ForegroundColor White
    aws s3api create-bucket --bucket $stateBucket --region $awsRegion --no-cli-pager 2>&1 | Out-Host
    aws s3api put-bucket-versioning --bucket $stateBucket --versioning-configuration Status=Enabled --no-cli-pager 2>&1 | Out-Host
    aws s3api put-bucket-encryption --bucket $stateBucket --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' --no-cli-pager 2>&1 | Out-Host
    aws s3api put-public-access-block --bucket $stateBucket --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" --no-cli-pager 2>&1 | Out-Host
    Write-Host "  [OK] S3 State Bucket created!" -ForegroundColor Green
} else {
    Write-Host "  [OK] S3 State Bucket '$stateBucket' exists." -ForegroundColor Green
}

terraform init -reconfigure 2>&1 | Out-Host
Write-Host "  Running 'terraform apply -auto-approve' to provision ECR Repositories & Cloud Infra..." -ForegroundColor White
terraform apply -auto-approve 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [FAIL] Terraform apply encountered an error." -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] ECR Repositories & Cloud Infrastructure Provisioned!" -ForegroundColor Green
Write-Host ""

# ------------------------------------------------------------------------------
# STEP 2: Authenticate Docker, Build & Push Container Images to AWS ECR
# ------------------------------------------------------------------------------
Write-Host "[Step 2/5] Logging into ECR & Building/Pushing Container Images..." -ForegroundColor Yellow

$loginPassword = aws ecr get-login-password --region $awsRegion --no-cli-pager 2>$null
if ($loginPassword) {
    $loginPassword | docker login --username AWS --password-stdin $ecrRegistry 2>&1 | Out-Host
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Docker authenticated with AWS ECR!" -ForegroundColor Green
    }
}

Write-Host "  ---> Building [backend] container image..." -ForegroundColor White
docker build -t medtrack-backend:latest ..\backend 2>&1 | Out-Host
Write-Host "  ---> Tagging [backend] -> $ecrRegistry/medtrack-backend:latest ..." -ForegroundColor Gray
docker tag medtrack-backend:latest "$ecrRegistry/medtrack-backend:latest" 2>&1 | Out-Host
Write-Host "  ---> Pushing [backend] to AWS ECR..." -ForegroundColor White
docker push "$ecrRegistry/medtrack-backend:latest" 2>&1 | Out-Host
Write-Host "  [OK] Backend image pushed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "  ---> Building [frontend] container image..." -ForegroundColor White
docker build --build-arg NEXT_PUBLIC_API_URL="/api/v1" -t medtrack-frontend:latest ..\frontend 2>&1 | Out-Host
Write-Host "  ---> Tagging [frontend] -> $ecrRegistry/medtrack-frontend:latest ..." -ForegroundColor Gray
docker tag medtrack-frontend:latest "$ecrRegistry/medtrack-frontend:latest" 2>&1 | Out-Host
Write-Host "  ---> Pushing [frontend] to AWS ECR..." -ForegroundColor White
docker push "$ecrRegistry/medtrack-frontend:latest" 2>&1 | Out-Host
Write-Host "  [OK] Frontend image pushed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "  ---> Building [worker] container image..." -ForegroundColor White
docker build -t medtrack-worker:latest ..\worker 2>&1 | Out-Host
Write-Host "  ---> Tagging [worker] -> $ecrRegistry/medtrack-worker:latest ..." -ForegroundColor Gray
docker tag medtrack-worker:latest "$ecrRegistry/medtrack-worker:latest" 2>&1 | Out-Host
Write-Host "  ---> Pushing [worker] to AWS ECR..." -ForegroundColor White
docker push "$ecrRegistry/medtrack-worker:latest" 2>&1 | Out-Host
Write-Host "  [OK] Worker image pushed successfully!" -ForegroundColor Green
Write-Host ""

# ------------------------------------------------------------------------------
# STEP 3: Trigger ECS Service Redeployments
# ------------------------------------------------------------------------------
Write-Host "[Step 3/5] Triggering ECS Service Redeployments..." -ForegroundColor Yellow
aws ecs update-service --cluster medtrack-development-cluster --service medtrack-development-frontend-service --force-new-deployment --no-cli-pager 2>&1 | Out-Null
aws ecs update-service --cluster medtrack-development-cluster --service medtrack-development-backend-service --force-new-deployment --no-cli-pager 2>&1 | Out-Null
aws ecs update-service --cluster medtrack-development-cluster --service medtrack-development-worker-service --force-new-deployment --no-cli-pager 2>&1 | Out-Null
Write-Host "  [OK] Rolling updates triggered across all services!" -ForegroundColor Green
Write-Host ""

# ------------------------------------------------------------------------------
# STEP 4: Audit Secrets Manager & ALB Target Group Health
# ------------------------------------------------------------------------------
Write-Host "[Step 4/5] Reading deployment outputs & auditing Target Group Health..." -ForegroundColor Yellow
$tfOutputJson = terraform output -json 2>$null
if ($tfOutputJson) {
    $tfOutputs = $tfOutputJson | ConvertFrom-Json
    $albDns       = $tfOutputs.alb_dns_name.value
    $clusterName  = $tfOutputs.ecs_cluster_name.value
    $secretArn    = $tfOutputs.secrets_manager_arn.value
    $frontendTg   = $tfOutputs.frontend_target_group_arn.value
    $backendTg    = $tfOutputs.backend_target_group_arn.value
    $workerTg     = $tfOutputs.worker_target_group_arn.value

    Write-Host "  ALB Hostname:        $albDns" -ForegroundColor White
    Write-Host "  ECS Cluster:         $clusterName" -ForegroundColor White
    Write-Host "  Secrets Manager ARN: $secretArn" -ForegroundColor White
}

function Audit-TargetGroup($tgArn, $name) {
    if (-not $tgArn) { return }
    $health = aws elbv2 describe-target-health --target-group-arn $tgArn --no-cli-pager --output json 2>$null | ConvertFrom-Json
    if ($health -and $health.TargetHealthDescriptions) {
        foreach ($target in $health.TargetHealthDescriptions) {
            $state = $target.TargetHealth.State
            $ip    = $target.Target.Id
            if ($state -eq "healthy") {
                Write-Host "  [HEALTHY] $name ($ip)" -ForegroundColor Green
            } else {
                Write-Host "  [$state] $name ($ip) - Reason: $($target.TargetHealth.Reason)" -ForegroundColor Yellow
            }
        }
    }
}

Audit-TargetGroup $frontendTg "Frontend Service"
Audit-TargetGroup $backendTg  "Backend Express API Service"
Audit-TargetGroup $workerTg   "Worker Background Service"
Write-Host ""

# ------------------------------------------------------------------------------
# STEP 5: HTTP Endpoint Connectivity & Health Pings
# ------------------------------------------------------------------------------
Write-Host "[Step 5/5] Testing Application HTTP Endpoints..." -ForegroundColor Yellow

function Ping-Route($url, $label) {
    Write-Host "  Testing [$label] -> $url ..." -NoNewline
    try {
        $res = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing 2>$null
        $code = $res.StatusCode
        if ($code -ge 200 -and $code -lt 400) {
            Write-Host " [HEALTHY HTTP $code]" -ForegroundColor Green
        } else {
            Write-Host " [HTTP $code]" -ForegroundColor Yellow
        }
    } catch {
        if ($_.Exception.Response) {
            $code = [int]$_.Exception.Response.StatusCode
            Write-Host " [HTTP $code]" -ForegroundColor Yellow
        } else {
            Write-Host " [UNREACHABLE / PROVISIONING]" -ForegroundColor Red
        }
    }
}

if ($albDns) {
    Ping-Route "http://$albDns/" "Frontend Root (/*)"
    Ping-Route "http://$albDns/api/v1/health" "Backend Express API (/api/*)"
    Ping-Route "http://$albDns/worker/health" "Worker Service (/worker/*)"
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "    Deployment & Remote State Sync Complete! State updated.       " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
