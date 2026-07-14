resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.project_name}-${var.environment}-secrets"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "app_secrets_val" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    NODE_ENV                     = var.environment
    PORT                         = "8080"
    LOG_LEVEL                    = "debug"
    MONGO_URI                    = "mongodb://${var.docdb_master_username}:${var.docdb_master_password}@${var.docdb_endpoint}:27017/medication_platform?tls=true&tlsAllowInvalidCertificates=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
    JWT_ACCESS_SECRET            = "bc82f3ef80dc4894392476d1e43bbcf5d1e2b5d4e892c90e1f7a3562a19c72e9"
    JWT_REFRESH_SECRET           = "8823f6d7ab71e4bf321096a605eddf83b28ee5390de2d103bf472ee91b05fc6a"
    COOKIE_SECRET                = "5e2bca810f723ea6df1b3e89cfcd922a"
    ENCRYPTION_KEY_AES256        = "1234567890abcdef1234567890abcdef"
    AWS_S3_BUCKET_NAME           = var.s3_bucket_id
    AWS_REGION                   = var.aws_region
    AWS_SNS_TOPIC_ARN            = var.sns_topic_arn
    AWS_SQS_QUEUE_URL            = var.sqs_queue_id
    VAPID_SUBJECT                = "mailto:admin@medplatform.com"
    VAPID_PUBLIC_KEY             = "BF_dummy_vapid_public_key_string"
    VAPID_PRIVATE_KEY            = "dummy_vapid_private_key_string"
    RATE_LIMIT_GLOBAL_MAX        = "100"
    RATE_LIMIT_GLOBAL_WINDOW_MS  = "60000"
    RATE_LIMIT_AUTH_MAX          = "5"
    RATE_LIMIT_AUTH_WINDOW_MS    = "900000"
    RATE_LIMIT_MEDIA_MAX         = "20"
    RATE_LIMIT_MEDIA_WINDOW_MS   = "3600000"
  })
}

resource "aws_iam_role" "ecs_task_role" {
  name = "${var.project_name}-${var.environment}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_policy" "app_policy" {
  name        = "${var.project_name}-${var.environment}-app-policy"
  description = "Minimal application policy for S3, SQS, SNS, and Secrets"

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
      },
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
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
          "sqs:GetQueueAttributes"
        ]
        Resource = [var.sqs_queue_arn]
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = [var.sns_topic_arn]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_app_policy" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.app_policy.arn
}


# ECS Task Execution Role (used by ECS agent to pull images and push logs)
resource "aws_iam_role" "ecs_execution_role" {
  name = "${var.project_name}-${var.environment}-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

# Attach standard AWS Fargate execution policy (allows pulling images, writing logs)
resource "aws_iam_role_policy_attachment" "ecs_execution_policy_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Also allow the execution role to retrieve secrets from Secrets Manager at boot
resource "aws_iam_policy" "secrets_read_policy" {
  name = "${var.project_name}-${var.environment}-secrets-read"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [aws_secretsmanager_secret.app_secrets.arn]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution_secrets_attach" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = aws_iam_policy.secrets_read_policy.arn
}