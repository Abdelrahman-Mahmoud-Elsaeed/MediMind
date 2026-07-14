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

# 1. Network Layer
module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  environment  = var.environment
}

# 2. Database Layer (DocumentDB)
module "database" {
  source                = "./modules/database"
  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.vpc.vpc_id
  subnet_ids            = module.vpc.private_subnet_ids
  vpc_cidr_block        = module.vpc.vpc_cidr_block
  docdb_master_username = var.docdb_master_username
  docdb_master_password = var.docdb_master_password
}

# 3. Storage Layer (S3)
module "storage" {
  source       = "./modules/storage"
  project_name = var.project_name
  environment  = var.environment
}

# 4. Messaging Layer (SNS + SQS)
module "messaging" {
  source       = "./modules/messaging"
  project_name = var.project_name
  environment  = var.environment
}

# 5. Security & Identity Layer (Secrets Manager + IAM Roles)
module "security" {
  source                = "./modules/security"
  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  docdb_master_username = var.docdb_master_username
  docdb_master_password = var.docdb_master_password
  docdb_endpoint        = module.database.endpoint
  s3_bucket_id          = module.storage.bucket_id
  s3_bucket_arn         = module.storage.bucket_arn
  sns_topic_arn         = module.messaging.sns_topic_arn
  sqs_queue_id          = module.messaging.sqs_queue_id
  sqs_queue_arn         = module.messaging.sqs_queue_arn
}

# 6. Compute Layer (AWS ECS Fargate)
module "ecs" {
  source       = "./modules/ecs"
  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  # Network Integration
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids  # For the ALB (Application Load Balancer)
  private_subnet_ids = module.vpc.private_subnet_ids # For the Fargate Tasks

  # IAM & Secrets Integration (provided by security module)
  ecs_execution_role_arn = module.security.ecs_execution_role_arn
  ecs_task_role_arn      = module.security.ecs_task_role_arn
  app_secrets_arn        = module.security.app_secrets_arn

  # Application Config (Adjust port & image as needed)
  container_image = "nginx:alpine" # Replace with your ECR image URI
  container_port  = 80
}