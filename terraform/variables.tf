variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  type    = string
  default = "development"
}

variable "project_name" {
  type    = string
  default = "medtrack"
}

variable "docdb_master_username" {
  type    = string
  default = "medadmin"
}

variable "docdb_master_password" {
  type      = string
  sensitive = true
  default   = "supersecure_db_password123"
}