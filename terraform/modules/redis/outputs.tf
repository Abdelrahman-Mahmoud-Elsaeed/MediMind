output "endpoint" {
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  description = "Primary endpoint address of the Redis ElastiCache cluster"
}

output "port" {
  value       = aws_elasticache_replication_group.redis.port
  description = "Port number of the Redis ElastiCache cluster"
}

output "redis_url" {
  value       = "redis://${aws_elasticache_replication_group.redis.primary_endpoint_address}:${aws_elasticache_replication_group.redis.port}"
  description = "Formatted Redis connection URL"
}
