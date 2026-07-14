output "sns_topic_arn" { value = aws_sns_topic.escalation_topic.arn }
output "sqs_queue_id" { value = aws_sqs_queue.escalation_queue.id }
output "sqs_queue_arn" { value = aws_sqs_queue.escalation_queue.arn }