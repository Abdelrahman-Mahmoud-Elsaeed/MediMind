variable "project_name" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "vpc_cidr_block" { type = string }
variable "docdb_master_username" { type = string }
variable "docdb_master_password" { type = string }