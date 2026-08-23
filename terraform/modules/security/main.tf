# Security Layer: IAM Roles, ECS Policies, and Secrets Manager

resource "random_password" "jwt_access_secret" {
  length           = 64
  special          = true
  override_special = "!@#$%^&*()-_=+[]{}|;:,.<>?"
  keepers = {
    rotation = var.secret_rotation_version
  }
}

resource "random_password" "jwt_refresh_secret" {
  length           = 64
  special          = true
  override_special = "!@#$%^&*()-_=+[]{}|;:,.<>?"
  keepers = {
    rotation = var.secret_rotation_version
  }
}

resource "random_password" "cookie_secret" {
  length           = 32
  special          = true
  override_special = "!@#$%^&*()-_=+[]{}|;:,.<>?"
  keepers = {
    rotation = var.secret_rotation_version
  }
}

resource "random_password" "worker_secret" {
  length  = 32
  special = false
  keepers = {
    rotation = var.secret_rotation_version
  }
}

resource "random_password" "encryption_key_aes256" {
  length  = 32
  special = false
  keepers = {
    rotation = var.secret_rotation_version
  }
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.project_name}-${var.environment}-secrets"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "app_secrets_val" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    NODE_ENV              = var.environment
    PORT                  = "8080"
    LOG_LEVEL             = "info"
    FRONTEND_URL          = var.alb_dns_name != "" ? "http://${var.alb_dns_name}" : "http://localhost:3000"
    NEXT_PUBLIC_API_URL   = var.alb_dns_name != "" ? "http://${var.alb_dns_name}/api/v1" : "http://localhost:8080/api/v1"
    MONGO_URI             = can(regex("^mongodb://", var.docdb_endpoint)) ? var.docdb_endpoint : "mongodb://${var.docdb_master_username}:${var.docdb_master_password}@${var.docdb_endpoint}:27017/medimind?tls=true&tlsAllowInvalidCertificates=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
    REDIS_URL             = var.redis_url != "" ? var.redis_url : "redis://localhost:6379"
    WORKER_URL            = var.alb_dns_name != "" ? "http://${var.alb_dns_name}/worker" : "http://localhost:3001"
    WORKER_SECRET         = random_password.worker_secret.result
    JWT_ACCESS_SECRET     = random_password.jwt_access_secret.result
    JWT_REFRESH_SECRET    = random_password.jwt_refresh_secret.result
    COOKIE_SECRET         = random_password.cookie_secret.result
    ENCRYPTION_KEY_AES256 = random_password.encryption_key_aes256.result
    AWS_REGION            = var.aws_region
    S3_BUCKET_NAME        = var.s3_bucket_id
    S3_BUCKET_ARN         = var.s3_bucket_arn
    SNS_TOPIC_ARN         = var.sns_topic_arn
    SQS_QUEUE_ID          = var.sqs_queue_id
    SQS_QUEUE_ARN         = var.sqs_queue_arn
  })
}

# --- IAM Roles for ECS Tasks ---

# 1. ECS Task Execution Role (Used by ECS Agent to pull images from ECR & post logs to CloudWatch)
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.project_name}-${var.environment}-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Attach standard AWS Task Execution Policy
resource "aws_iam_role_policy_attachment" "ecs_execution_policy_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Policy allowing ECS Execution Role to read Secrets Manager secrets
resource "aws_iam_policy" "secrets_read_policy" {
  name        = "${var.project_name}-${var.environment}-secrets-read"
  description = "Allows ECS agent to retrieve application secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [aws_secretsmanager_secret.app_secrets.arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_secrets_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.secrets_read_policy.arn
}

# 2. ECS Task Role (Used inside containers by Application Code to access AWS services: S3, SQS, SNS)
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-${var.environment}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Application Policy for S3, SQS, and SNS access
resource "aws_iam_policy" "app_permissions_policy" {
  name        = "${var.project_name}-${var.environment}-app-permissions"
  description = "Permissions for backend/worker application code to interact with S3, SNS, and SQS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl"
        ]
        Resource = [var.sqs_queue_arn]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = [var.sns_topic_arn]
      },
      {
        Effect = "Allow"
        Action = [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_permissions_attach" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.app_permissions_policy.arn
}