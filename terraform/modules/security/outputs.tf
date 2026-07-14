output "secrets_manager_arn" { 
  value = aws_secretsmanager_secret.app_secrets.arn 
}

output "app_secrets_arn" { 
  value = aws_secretsmanager_secret.app_secrets.arn 
}

output "ecs_task_role_arn" { 
  value = aws_iam_role.ecs_task_role.arn 
}

output "ecs_execution_role_arn" { 
  value = aws_iam_role.ecs_execution_role.arn 
}