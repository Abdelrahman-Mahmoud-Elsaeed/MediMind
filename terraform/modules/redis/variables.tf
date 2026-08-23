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
  description = "VPC ID where Redis is deployed"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private Subnet IDs for ElastiCache Subnet Group"
}

variable "vpc_cidr_block" {
  type        = string
  description = "VPC CIDR block for internal security group access"
}

variable "node_type" {
  type        = string
  default     = "cache.t3.micro"
  description = "AWS ElastiCache node instance type"
}
