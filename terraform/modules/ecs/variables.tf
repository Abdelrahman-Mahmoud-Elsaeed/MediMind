variable "project_name" {
  type        = string
  description = "Project identifier name"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. production, staging, development)"
}

variable "aws_region" {
  type        = string
  description = "Target AWS deployment region"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where resources are deployed"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets for Fargate task containers"
}

variable "ecs_execution_role_arn" {
  type        = string
  description = "IAM Execution Role ARN for ECS agent image pull and log creation"
}

variable "ecs_task_role_arn" {
  type        = string
  description = "IAM Task Role ARN for container runtime permissions"
}

variable "app_secrets_arn" {
  type        = string
  description = "AWS Secrets Manager Secret ARN for environment variable injection"
}

variable "alb_security_group_id" {
  type        = string
  description = "Security Group ID of the Application Load Balancer"
}

variable "frontend_target_group_arn" {
  type        = string
  description = "Target Group ARN for Frontend Service"
}

variable "backend_target_group_arn" {
  type        = string
  description = "Target Group ARN for Backend API Service"
}

variable "worker_target_group_arn" {
  type        = string
  description = "Target Group ARN for Worker Service"
}

variable "frontend_container_image" {
  type        = string
  default     = "nginx:alpine"
  description = "ECR Image URI for Frontend Next.js service"
}

variable "backend_container_image" {
  type        = string
  default     = "node:18-alpine"
  description = "ECR Image URI for Backend Express API service"
}

variable "worker_container_image" {
  type        = string
  default     = "node:18-alpine"
  description = "ECR Image URI for Worker background service"
}