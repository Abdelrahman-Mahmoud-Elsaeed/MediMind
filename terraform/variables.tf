variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Target AWS deployment region"
}

variable "environment" {
  type        = string
  default     = "development"
  description = "Deployment environment name"
}

variable "project_name" {
  type        = string
  default     = "medtrack"
  description = "Project name prefix for AWS resources"
}

variable "enable_docdb" {
  type        = bool
  default     = false
  description = "Set to true to provision AWS DocumentDB cluster. Default is false for AWS Free Plan compatibility."
}

variable "docdb_master_username" {
  type        = string
  default     = "medadmin"
  description = "DocumentDB master username"
}

variable "docdb_master_password" {
  type        = string
  sensitive   = true
  default     = "supersecure_db_password123"
  description = "DocumentDB master password"
}

variable "frontend_container_image" {
  type        = string
  default     = ""
  description = "ECR Image URI for Frontend service (defaults to module.ecr.frontend_repository_url:latest)"
}

variable "backend_container_image" {
  type        = string
  default     = ""
  description = "ECR Image URI for Backend API service (defaults to module.ecr.backend_repository_url:latest)"
}

variable "worker_container_image" {
  type        = string
  default     = ""
  description = "ECR Image URI for Worker background service (defaults to module.ecr.worker_repository_url:latest)"
}

variable "secret_rotation_version" {
  type        = string
  default     = "v1"
  description = "Increment version string to trigger dynamic secret rotation (e.g. v2, v3)"
}

variable "gemini_api_key" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Google Gemini AI API Key"
}

variable "qwen_api_key" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Alibaba Qwen AI API Key"
}

variable "resend_api_key" {
  type        = string
  sensitive   = true
  default     = ""
  description = "Resend Transactional Email API Key"
}

variable "vapid_public_key" {
  type        = string
  default     = ""
  description = "VAPID Public Key for Web Push Notifications"
}

variable "vapid_private_key" {
  type        = string
  sensitive   = true
  default     = ""
  description = "VAPID Private Key for Web Push Notifications"
}