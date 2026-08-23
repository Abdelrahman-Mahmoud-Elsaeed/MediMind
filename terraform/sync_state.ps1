# ==============================================================================
# MediMind — State Synchronization Script (Imports Existing AWS Resources into S3 State)
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "Synchronizing pre-existing AWS resources into Terraform state..." -ForegroundColor Yellow

$awsIdentity = aws sts get-caller-identity --output json 2>$null | ConvertFrom-Json
$accountId = $awsIdentity.Account

function Import-If-Exists($address, $id) {
    Write-Host "  Syncing $address -> $id ..." -NoNewline
    $res = terraform import -input=false $address $id 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [IMPORTED]" -ForegroundColor Green
    } else {
        Write-Host " [IN STATE OR SKIPPED]" -ForegroundColor Gray
    }
}

# 1. State Bucket
Import-If-Exists "module.tf_backend.aws_s3_bucket.terraform_state" "medtrack-development-tfstate-$accountId"

# 2. Storage Bucket
Import-If-Exists "module.storage.aws_s3_bucket.images" "medtrack-development-images-$accountId"

# 3. ECR Repositories
Import-If-Exists "module.ecr.aws_ecr_repository.frontend" "medtrack-frontend"
Import-If-Exists "module.ecr.aws_ecr_repository.backend" "medtrack-backend"
Import-If-Exists "module.ecr.aws_ecr_repository.worker" "medtrack-worker"

# 4. CloudWatch Log Groups
Import-If-Exists "module.ecs.aws_cloudwatch_log_group.frontend" "/ecs/medtrack-development/frontend"
Import-If-Exists "module.ecs.aws_cloudwatch_log_group.backend" "/ecs/medtrack-development/backend"
Import-If-Exists "module.ecs.aws_cloudwatch_log_group.worker" "/ecs/medtrack-development/worker"

# 5. Security & IAM
Import-If-Exists "module.security.aws_secretsmanager_secret.app_secrets" "medtrack-development-secrets"
Import-If-Exists "module.security.aws_iam_role.ecs_task_role" "medtrack-development-task-role"
Import-If-Exists "module.security.aws_iam_role.ecs_execution_role" "medtrack-development-execution-role"

# 6. ALB & Target Groups
$frontendTgArn = (aws elbv2 describe-target-groups --names "medtrack-development-frontend-tg" --query "TargetGroups[0].TargetGroupArn" --output text 2>$null)
if ($frontendTgArn -and $frontendTgArn -ne "None") { Import-If-Exists "module.alb.aws_lb_target_group.frontend" $frontendTgArn }

$backendTgArn = (aws elbv2 describe-target-groups --names "medtrack-development-backend-tg" --query "TargetGroups[0].TargetGroupArn" --output text 2>$null)
if ($backendTgArn -and $backendTgArn -ne "None") { Import-If-Exists "module.alb.aws_lb_target_group.backend" $backendTgArn }

$workerTgArn = (aws elbv2 describe-target-groups --names "medtrack-development-worker-tg" --query "TargetGroups[0].TargetGroupArn" --output text 2>$null)
if ($workerTgArn -and $workerTgArn -ne "None") { Import-If-Exists "module.alb.aws_lb_target_group.worker" $workerTgArn }

$albArn = (aws elbv2 describe-load-balancers --names "medtrack-development-alb" --query "LoadBalancers[0].LoadBalancerArn" --output text 2>$null)
if ($albArn -and $albArn -ne "None") { Import-If-Exists "module.alb.aws_lb.main" $albArn }

Write-Host "State synchronization complete!" -ForegroundColor Green
