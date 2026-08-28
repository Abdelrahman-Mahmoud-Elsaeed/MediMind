output "frontend_ecr_repo" {
  value       = module.ecr.frontend_repository_url
  description = "AWS ECR Repository URL for Frontend Docker image"
}

output "backend_ecr_repo" {
  value       = module.ecr.backend_repository_url
  description = "AWS ECR Repository URL for Backend Express Docker image"
}

output "worker_ecr_repo" {
  value       = module.ecr.worker_repository_url
  description = "AWS ECR Repository URL for Worker Docker image"
}

output "secrets_manager_arn" {
  value       = module.security.secrets_manager_arn
  description = "AWS Secrets Manager Secret ARN storing environment configuration"
}

output "docdb_endpoint" {
  value       = var.enable_docdb ? module.database[0].endpoint : "mongodb://mongodb.medtrack.local:27017/medimind"
  description = "MongoDB / DocumentDB Connection Endpoint"
}

output "redis_endpoint" {
  value       = module.redis.endpoint
  description = "AWS ElastiCache Redis primary endpoint address"
}

output "redis_url" {
  value       = module.redis.redis_url
  description = "Redis connection string injected into AWS Secrets Manager"
}

output "alb_dns_name" {
  value       = module.alb.alb_dns_name
  description = "Public Load Balancer DNS Name routing traffic to Frontend, Backend (/api/*), and Worker (/worker/*)"
}

output "ecs_cluster_name" {
  value       = module.ecs.ecs_cluster_name
  description = "AWS ECS Cluster Name hosting Frontend, Backend, and Worker Fargate services"
}

output "ecs_task_role_arn" {
  value       = module.security.ecs_task_role_arn
  description = "IAM Task Role ARN for ECS containers"
}

output "ecs_execution_role_arn" {
  value       = module.security.ecs_execution_role_arn
  description = "IAM Execution Role ARN for ECS agent image pulls and log creation"
}

output "frontend_target_group_arn" {
  value       = module.alb.frontend_target_group_arn
  description = "ALB Target Group ARN for Frontend Next.js Service"
}

output "backend_target_group_arn" {
  value       = module.alb.backend_target_group_arn
  description = "ALB Target Group ARN for Backend Express API Service"
}

output "worker_target_group_arn" {
  value       = module.alb.worker_target_group_arn
  description = "ALB Target Group ARN for Worker Background Service"
}