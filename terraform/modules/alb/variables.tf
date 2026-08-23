variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where the load balancer is deployed"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public Subnet IDs for Application Load Balancer"
}
