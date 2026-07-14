output "alb_dns_name" {
  description = "The public URL of your ECS application"
  value       = aws_lb.main.dns_name
}