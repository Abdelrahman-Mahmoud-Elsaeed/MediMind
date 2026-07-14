resource "aws_sns_topic" "escalation_topic" {
  name = "${var.project_name}-${var.environment}-escalation-topic"
}

resource "aws_sqs_queue" "escalation_queue" {
  name                       = "${var.project_name}-${var.environment}-escalation-queue"
  delay_seconds              = 900
  visibility_timeout_seconds = 1800
  message_retention_seconds  = 86400

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.escalation_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "escalation_dlq" {
  name = "${var.project_name}-${var.environment}-escalation-dlq"
}

resource "aws_sns_topic_subscription" "sqs_subscription" {
  topic_arn = aws_sns_topic.escalation_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.escalation_queue.arn
}

resource "aws_sqs_queue_policy" "sqs_policy" {
  queue_url = aws_sqs_queue.escalation_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.escalation_queue.arn
      Condition = {
        ArnEquals = {
          "aws:SourceArn" = aws_sns_topic.escalation_topic.arn
        }
      }
    }]
  })
}