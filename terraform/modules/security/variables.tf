variable "project_name" { type = string }
variable "environment" { type = string }
variable "aws_region" { type = string }
variable "docdb_master_username" { type = string }
variable "docdb_master_password" { type = string }
variable "docdb_endpoint" { type = string }
variable "s3_bucket_id" { type = string }
variable "s3_bucket_arn" { type = string }
variable "sns_topic_arn" { type = string }
variable "sqs_queue_id" { type = string }
variable "sqs_queue_arn" { type = string }
variable "alb_dns_name" {
  type        = string
  default     = ""
  description = "Application Load Balancer DNS name for dynamic endpoint configuration"
}
variable "redis_url" {
  type        = string
  default     = ""
  description = "Redis ElastiCache Cluster connection URL"
}
variable "secret_rotation_version" {
  type        = string
  default     = "v1"
  description = "Increment version string to trigger dynamic secret rotation (e.g. v2, v3)"
}
variable "gemini_api_key" {
  type      = string
  default   = ""
  sensitive = true
}

variable "qwen_api_key" {
  type      = string
  default   = ""
  sensitive = true
}

variable "resend_api_key" {
  type      = string
  default   = ""
  sensitive = true
}

variable "vapid_public_key" {
  type    = string
  default = ""
}

variable "vapid_private_key" {
  type      = string
  default   = ""
  sensitive = true
}