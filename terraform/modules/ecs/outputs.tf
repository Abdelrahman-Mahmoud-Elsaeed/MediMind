output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "Name of the created ECS Cluster"
}

output "ecs_tasks_security_group_id" {
  value       = aws_security_group.ecs_tasks.id
  description = "Security Group ID of the ECS Fargate tasks"
}