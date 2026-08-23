output "frontend_repository_url" {
  value       = aws_ecr_repository.frontend.repository_url
  description = "ECR Repository URL for Frontend"
}

output "backend_repository_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "ECR Repository URL for Backend"
}

output "worker_repository_url" {
  value       = aws_ecr_repository.worker.repository_url
  description = "ECR Repository URL for Worker"
}
