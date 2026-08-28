terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Container Registry Layer (AWS ECR Repositories)
module "ecr" {
  source       = "./modules/ecr"
  project_name = var.project_name
  environment  = var.environment
}

# 2. Network Layer
module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  environment  = var.environment
}

# 3. Application Load Balancer Layer (ALB)
module "alb" {
  source            = "./modules/alb"
  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
}

# 4. Database Layer (DocumentDB - Optional)
module "database" {
  count                 = var.enable_docdb ? 1 : 0
  source                = "./modules/database"
  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  vpc_cidr_block        = module.vpc.vpc_cidr_block
  docdb_master_username = var.docdb_master_username
  docdb_master_password = var.docdb_master_password
}

# 5. Cache & Queue Layer (AWS ElastiCache Redis)
module "redis" {
  source         = "./modules/redis"
  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  vpc_cidr_block = module.vpc.vpc_cidr_block
}

# 6. Storage Layer (S3)
module "storage" {
  source       = "./modules/storage"
  project_name = var.project_name
  environment  = var.environment
}

# 7. Messaging Layer (SNS + SQS)
module "messaging" {
  source       = "./modules/messaging"
  project_name = var.project_name
  environment  = var.environment
}

# 8. Security & Identity Layer (Secrets Manager + IAM Roles)
module "security" {
  source                  = "./modules/security"
  project_name            = var.project_name
  environment             = var.environment
  aws_region              = var.aws_region
  docdb_master_username   = var.docdb_master_username
  docdb_master_password   = var.docdb_master_password
  docdb_endpoint          = var.enable_docdb ? module.database[0].endpoint : "mongodb://mongodb.medtrack.local:27017/medimind"
  s3_bucket_id            = module.storage.bucket_id
  s3_bucket_arn           = module.storage.bucket_arn
  sns_topic_arn           = module.messaging.sns_topic_arn
  sqs_queue_id            = module.messaging.sqs_queue_id
  sqs_queue_arn           = module.messaging.sqs_queue_arn
  alb_dns_name            = module.alb.alb_dns_name
  redis_url               = module.redis.redis_url
  secret_rotation_version = var.secret_rotation_version
  gemini_api_key          = var.gemini_api_key
  qwen_api_key            = var.qwen_api_key
  resend_api_key          = var.resend_api_key
  vapid_public_key        = var.vapid_public_key
  vapid_private_key       = var.vapid_private_key
}

# 9. Compute Layer (AWS ECS Fargate Services: Frontend, Backend, Worker, MongoDB)
module "ecs" {
  source       = "./modules/ecs"
  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # Network & Load Balancer Integration
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_subnet_ids
  alb_security_group_id     = module.alb.alb_security_group_id
  frontend_target_group_arn = module.alb.frontend_target_group_arn
  backend_target_group_arn  = module.alb.backend_target_group_arn
  worker_target_group_arn   = module.alb.worker_target_group_arn

  # IAM & Secrets Integration (provided by security module)
  ecs_execution_role_arn = module.security.ecs_execution_role_arn
  ecs_task_role_arn      = module.security.ecs_task_role_arn
  app_secrets_arn        = module.security.app_secrets_arn

  # Application Container Images (ECR Image URIs)
  frontend_container_image = var.frontend_container_image != "" ? var.frontend_container_image : "${module.ecr.frontend_repository_url}:latest"
  backend_container_image  = var.backend_container_image != "" ? var.backend_container_image : "${module.ecr.backend_repository_url}:latest"
  worker_container_image   = var.worker_container_image != "" ? var.worker_container_image : "${module.ecr.worker_repository_url}:latest"
}