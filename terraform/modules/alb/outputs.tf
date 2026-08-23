output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "Public DNS name of the Application Load Balancer"
}

output "alb_arn" {
  value       = aws_lb.main.arn
  description = "ARN of the Application Load Balancer"
}

output "alb_security_group_id" {
  value       = aws_security_group.alb.id
  description = "Security Group ID of the Application Load Balancer"
}

output "frontend_target_group_arn" {
  value       = aws_lb_target_group.frontend.arn
  description = "ARN of the Frontend target group"
}

output "backend_target_group_arn" {
  value       = aws_lb_target_group.backend.arn
  description = "ARN of the Backend API target group"
}

output "worker_target_group_arn" {
  value       = aws_lb_target_group.worker.arn
  description = "ARN of the Worker target group"
}

output "http_listener_arn" {
  value       = aws_lb_listener.http.arn
  description = "ARN of the HTTP listener"
}
