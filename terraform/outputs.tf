output "secrets_manager_arn" {
  value       = module.security.secrets_manager_arn
  description = "Secrets Manager ARN to fetch .env config"
}

output "docdb_endpoint" {
  value       = module.database.endpoint
  description = "MongoDB Connection Endpoint"
}

output "ecs_task_role_arn" {
  value       = module.security.ecs_task_role_arn
  description = "IAM Role ARN for your ECS containers"
}